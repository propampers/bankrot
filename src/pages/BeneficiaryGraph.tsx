import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Background, BackgroundVariant,
  useNodesState, useEdgesState,
  type Node, type Edge, type NodeProps,
  Handle, Position, MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import { api } from '@/shared/api'
import { GraphNode } from '@/shared/types'

interface NodeData extends GraphNode {
  [key: string]: unknown
}

function GraphNodeUI({ data }: NodeProps) {
  const d = data as NodeData
  const isPerson = d.nodeType === 'person'
  const isMain = d.nodeType === 'company_main'

  const bg = isMain
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    : isPerson
    ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
    : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'

  const border = isMain ? '#60a5fa' : isPerson ? '#a78bfa' : '#4b5563'
  const glow = isMain
    ? '0 0 16px rgba(59,130,246,0.5)'
    : isPerson
    ? '0 0 12px rgba(124,58,237,0.4)'
    : 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={{
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: isPerson ? '50%' : 10,
        width: isPerson ? 56 : 64,
        height: isPerson ? 56 : 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        boxShadow: glow,
      }}>
        {isMain ? '🏢' : isPerson ? '👤' : '🏭'}
      </div>
      <div style={{ textAlign: 'center', maxWidth: 100 }}>
        <div style={{
          fontSize: 11, fontWeight: isMain ? 700 : 500,
          color: '#fff', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {d.label}
        </div>
        {d.role && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {d.role}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  )
}

const nodeTypes = { graphNode: GraphNodeUI }

function layoutNodes(rawNodes: GraphNode[]): Node[] {
  const main = rawNodes.find(n => n.nodeType === 'company_main')
  const persons = rawNodes.filter(n => n.nodeType === 'person')
  const companies = rawNodes.filter(n => n.nodeType === 'company')

  const result: Node[] = []
  const CX = 180, CY = 200

  if (main) {
    result.push({ id: main.id, type: 'graphNode', position: { x: CX, y: CY }, data: { ...main } })
  }

  persons.forEach((p, i) => {
    const total = persons.length
    const spread = Math.min(total * 140, 400)
    const x = CX - spread / 2 + (spread / Math.max(total - 1, 1)) * i
    result.push({ id: p.id, type: 'graphNode', position: { x: x - 50, y: CY - 150 }, data: { ...p } })
  })

  const perRow = Math.min(companies.length, 3)
  companies.forEach((c, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const total = Math.min(perRow, companies.length - row * perRow)
    const spread = total * 150
    const x = CX - spread / 2 + 150 * col
    result.push({ id: c.id, type: 'graphNode', position: { x: x - 50, y: CY + 160 + row * 130 }, data: { ...c } })
  })

  return result
}

function buildEdges(rawEdges: { id: string; source: string; target: string; label?: string }[]): Edge[] {
  return rawEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: '#4b5563', strokeWidth: 1.5 },
    labelStyle: { fill: '#9ca3af', fontSize: 10 },
    labelBgStyle: { fill: 'rgba(17,24,39,0.8)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
  }))
}

export default function BeneficiaryGraph() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(() => nav(-1))
    return () => window.Telegram?.WebApp?.BackButton?.hide()
  }, [nav])

  useEffect(() => {
    if (!id) return
    api.graph(Number(id))
      .then(data => {
        if (data.nodes.length <= 1) { setEmpty(true); return }
        setNodes(layoutNodes(data.nodes))
        setEdges(buildEdges(data.edges))
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="loader"><div className="spinner" /><span>Строю граф…</span></div>
  )

  if (empty) return (
    <div className="loader" style={{ flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🔍</div>
      <div style={{ fontWeight: 600 }}>Недостаточно данных</div>
      <div style={{ fontSize: 13, color: 'var(--hint)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
        Граф строится из данных анализа. Добавь больше информации о компании через /inn
      </div>
      <button
        onClick={() => nav(-1)}
        style={{ marginTop: 8, color: 'var(--accent)', fontSize: 14 }}
      >
        ← Назад
      </button>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(13,13,13,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={() => nav(-1)} style={{ color: 'var(--accent)', fontSize: 14 }}>← Назад</button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Граф связей</div>
      </div>

      {/* Graph */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          panOnDrag
          zoomOnScroll
          minZoom={0.3}
          maxZoom={2.5}
          style={{ background: '#0d0d0d' }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(59,130,246,0.1)" />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div style={{
        padding: '10px 20px',
        background: 'rgba(13,13,13,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 20, justifyContent: 'center',
        fontSize: 11, color: 'var(--hint)',
        flexShrink: 0, marginBottom: 72,
      }}>
        <span>🏢 Должник</span>
        <span>👤 Персона</span>
        <span>🏭 Связанная</span>
      </div>
    </motion.div>
  )
}
