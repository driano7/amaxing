'use client'

import React from 'react'
import { useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'
import { SequentialBarShape } from './SequentialBarShape'
import { SequentialChartDataRenderer } from './SequentialChartDataRenderer'

const CHART_IN_VIEW_OPTIONS = { margin: '0px 0px -10% 0px', amount: 0.5, once: true } as const

const ORANGE_PRIMARY = '#f97316'
const ORANGE_ACCENT = '#fb923c'
const ORANGE_DEEP = '#ea580c'
const ORANGE_LIGHT = '#fed7aa'
const AMBER_ACCENT = '#fbbf24'

const createSequentialBarShape = (
  shouldReduceMotion: boolean,
  orientation: 'vertical' | 'horizontal'
) =>
  function SequentialBarShapeRenderer(props: {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string
    index?: number
  }) {
    return (
      <SequentialBarShape {...props} reduceMotion={shouldReduceMotion} orientation={orientation} />
    )
  }

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const downloadChartPng = async (container: HTMLDivElement | null, filename: string) => {
  if (!container) return
  try {
    const dataUrl = await toPng(container, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: 'transparent',
    })
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
  } catch {
    // fallback
  }
}

const EmptyChart = ({ text }: { text: string }) => (
  <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-zinc-200/50 text-xs text-zinc-400 dark:border-white/10 dark:text-zinc-500">
    {text}
  </div>
)

export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: any
}

interface SequentialBarChartProps {
  data: ChartDataPoint[]
  title: string
  description?: string
  dataKey: string
  nameKey: string
  color?: string
  layout?: 'vertical' | 'horizontal'
  showPngButton?: boolean
  pngFilename?: string
  height?: number
  stepMs?: number
}

export function SequentialBarChart({
  data,
  title,
  description,
  dataKey,
  nameKey,
  color = ORANGE_PRIMARY,
  layout = 'vertical',
  showPngButton = true,
  pngFilename,
  height = 220,
  stepMs = 80,
}: SequentialBarChartProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const chartRef = useRef<HTMLDivElement>(null)
  const visible = useInView(chartRef, CHART_IN_VIEW_OPTIONS)

  if (!data.length) {
    return (
      <article className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</p>
          {showPngButton && pngFilename && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => void downloadChartPng(chartRef.current, pngFilename)}
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              PNG
            </Button>
          )}
        </div>
        {description && <p className="mb-2 text-xs text-zinc-400">{description}</p>}
        <EmptyChart text="Sin datos disponibles" />
      </article>
    )
  }

  const shape = createSequentialBarShape(shouldReduceMotion, layout)

  return (
    <article className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</p>
        {showPngButton && pngFilename && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => void downloadChartPng(chartRef.current, pngFilename)}
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            PNG
          </Button>
        )}
      </div>
      {description && <p className="mb-2 text-xs text-zinc-400">{description}</p>}
      <div ref={chartRef} className="h-[220px]" style={{ height }}>
        <SequentialChartDataRenderer
          data={data}
          active={visible}
          reduceMotion={shouldReduceMotion}
          stepMs={stepMs}
        >
          {({ data: visibleData }) => (
            <ResponsiveContainer width="100%" height="100%">
              {layout === 'vertical' ? (
                <BarChart data={[...visibleData]} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey={nameKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #f97316',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: '#18181b', fontWeight: 600 }}
                    itemStyle={{ color: '#18181b' }}
                  />
                  <Bar
                    dataKey={dataKey}
                    fill={color}
                    radius={layout === 'vertical' ? [6, 6, 0, 0] : [0, 6, 6, 0]}
                    isAnimationActive={false}
                    shape={shape as any}
                  />
                </BarChart>
              ) : (
                <BarChart
                  data={[...visibleData]}
                  layout="vertical"
                  margin={{ left: 12, right: 8, top: 8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="currentColor"
                    opacity={0.1}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                  />
                  <YAxis
                    dataKey={nameKey}
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #f97316',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: '#18181b', fontWeight: 600 }}
                    itemStyle={{ color: '#18181b' }}
                  />
                  <Bar
                    dataKey={dataKey}
                    fill={color}
                    radius={[0, 6, 6, 0]}
                    isAnimationActive={false}
                    shape={shape as any}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </SequentialChartDataRenderer>
      </div>
    </article>
  )
}

interface SequentialLineChartProps {
  data: ChartDataPoint[]
  title: string
  description?: string
  lines: Array<{ dataKey: string; name: string; color: string }>
  xKey: string
  showPngButton?: boolean
  pngFilename?: string
  height?: number
  stepMs?: number
  yDomain?: [number, number]
}

export function SequentialLineChart({
  data,
  title,
  description,
  lines,
  xKey,
  showPngButton = true,
  pngFilename,
  height = 220,
  stepMs = 85,
  yDomain,
}: SequentialLineChartProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const chartRef = useRef<HTMLDivElement>(null)
  const visible = useInView(chartRef, CHART_IN_VIEW_OPTIONS)

  if (!data.length) {
    return (
      <article className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</p>
          {showPngButton && pngFilename && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => void downloadChartPng(chartRef.current, pngFilename)}
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              PNG
            </Button>
          )}
        </div>
        {description && <p className="mb-2 text-xs text-zinc-400">{description}</p>}
        <EmptyChart text="Sin datos disponibles" />
      </article>
    )
  }

  return (
    <article className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</p>
        {showPngButton && pngFilename && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => void downloadChartPng(chartRef.current, pngFilename)}
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            PNG
          </Button>
        )}
      </div>
      {description && <p className="mb-2 text-xs text-zinc-400">{description}</p>}
      <div ref={chartRef} className="h-[220px]" style={{ height }}>
        <SequentialChartDataRenderer
          data={data}
          active={visible}
          reduceMotion={shouldReduceMotion}
          stepMs={stepMs}
        >
          {({ data: visibleData }) => (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...visibleData]} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  domain={yDomain ? yDomain : [0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #f97316',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: '#18181b', fontWeight: 600 }}
                  itemStyle={{ color: '#18181b' }}
                />
                {lines.map((line, index) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={2.5}
                    dot={{
                      r: 3.5,
                      fill: line.color,
                      strokeWidth: 0,
                    }}
                    isAnimationActive={!shouldReduceMotion}
                    animationDuration={800}
                    animationEasing="easeOut"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </SequentialChartDataRenderer>
      </div>
    </article>
  )
}

interface SequentialRadialBarChartProps {
  percent: number
  title: string
  description?: string
  color?: string
  size?: number
  periodLabel?: string
  coveredDays?: number
  expectedDays?: number
}

export function SequentialRadialBarChart({
  percent: percentValue,
  title,
  description,
  color = ORANGE_PRIMARY,
  size = 88,
  periodLabel,
  coveredDays,
  expectedDays,
}: SequentialRadialBarChartProps) {
  const percent = clampPercent(percentValue)
  const chartData = [{ name: 'coverage', value: percent, fill: color }]

  return (
    <article className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      {description && <p className="mt-1 text-xs text-zinc-400">{description}</p>}
      <div className="mt-3 flex items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: '#f1f5f9', opacity: 0.5 }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-900 dark:text-white">
            {percent.toFixed(0)}%
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {periodLabel && (
            <p className="font-semibold text-zinc-900 dark:text-white">{periodLabel}</p>
          )}
          {coveredDays !== undefined && <p>{coveredDays} días con actividad</p>}
          {expectedDays !== undefined && <p>{expectedDays} días esperados</p>}
        </div>
      </div>
    </article>
  )
}

export interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: string
}

export function StatCard({ label, value, icon, color = ORANGE_PRIMARY }: StatCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200/50 bg-white/80 p-3 dark:border-white/10 dark:bg-zinc-900/50">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black text-zinc-900 dark:text-white">{value}</p>
      {icon && <div className="mt-2 text-2xl">{icon}</div>}
    </article>
  )
}
