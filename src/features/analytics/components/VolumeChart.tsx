import React, { useEffect, useRef, useState } from 'react'

interface ChartDataPoint {
  x: string
  period: string
  volume: number
  revenue: number
  revenueRaw: number
  deals: number
  avgVolume: number
  avgRate: number
}

interface VolumeChartProps {
  data: ChartDataPoint[]
  loading: boolean
  insights?: {
    volumeChange: string
    revenueChange: string
    dealChange: string
    trend: 'up' | 'down' | 'stable'
    totalVolume: number
    totalRevenue: number
    totalDeals: number
  } | null
  mode?: 'volume' | 'revenue' | 'both'
  height?: number
}

export function VolumeChart({ 
  data, 
  loading, 
  insights, 
  mode = 'both', 
  height = 400 
}: VolumeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null)

  useEffect(() => {
    if (loading || !data.length) return

    // Animate the chart drawing
    let startTime: number
    const duration = 2000 // 2 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setAnimationProgress(easeOutQuart)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [data, loading])

  useEffect(() => {
    if (!canvasRef.current || loading || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 60, bottom: 60, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (data.length === 0) return

    // Calculate scales
    const maxVolume = Math.max(...data.map(d => d.volume))
    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const xStep = chartWidth / (data.length - 1)

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    // Vertical grid lines
    const stepSize = Math.max(1, Math.floor(data.length / 6))
    for (let i = 0; i < data.length; i += stepSize) {
      const x = padding.left + xStep * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    
    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.stroke()
    
    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.stroke()

    // Draw volume line (green)
    if (mode === 'volume' || mode === 'both') {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.beginPath()

      const animatedLength = Math.floor(data.length * animationProgress)
      
      data.slice(0, animatedLength).forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.volume / maxVolume) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw area fill
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top + chartHeight)
      
      data.slice(0, animatedLength).forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.volume / maxVolume) * chartHeight
        ctx.lineTo(x, y)
      })
      
      if (animatedLength > 0) {
        const lastX = padding.left + xStep * (animatedLength - 1)
        ctx.lineTo(lastX, padding.top + chartHeight)
      }
      ctx.closePath()
      ctx.fill()

      // Draw data points
      ctx.fillStyle = '#10b981'
      data.slice(0, animatedLength).forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.volume / maxVolume) * chartHeight
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    // Draw revenue line (blue)
    if (mode === 'revenue' || mode === 'both') {
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 3
      ctx.beginPath()

      const animatedLength = Math.floor(data.length * animationProgress)
      
      data.slice(0, animatedLength).forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.revenue / maxRevenue) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw data points
      ctx.fillStyle = '#2563eb'
      data.slice(0, animatedLength).forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.revenue / maxRevenue) * chartHeight
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'

    // X-axis labels
    data.forEach((point, index) => {
      if (index % stepSize === 0) {
        const x = padding.left + xStep * index
        ctx.fillText(point.period, x, padding.top + chartHeight + 20)
      }
    })

    // Y-axis labels (volume)
    if (mode === 'volume' || mode === 'both') {
      ctx.textAlign = 'right'
      ctx.fillStyle = '#10b981'
      for (let i = 0; i <= 5; i++) {
        const value = (maxVolume / 5) * (5 - i)
        const y = padding.top + (chartHeight / 5) * i + 4
        ctx.fillText(`${value.toFixed(0)} MT`, padding.left - 10, y)
      }
    }

    // Y-axis labels (revenue) - right side
    if (mode === 'revenue' || mode === 'both') {
      ctx.textAlign = 'left'
      ctx.fillStyle = '#2563eb'
      for (let i = 0; i <= 5; i++) {
        const value = (maxRevenue / 5) * (5 - i)
        const y = padding.top + (chartHeight / 5) * i + 4
        ctx.fillText(`₹${value.toFixed(1)}L`, padding.left + chartWidth + 10, y)
      }
    }

    // Draw tooltip if hovering
    if (hoveredPoint && hoveredPoint.index < data.length) {
      const point = data[hoveredPoint.index]
      const tooltipX = hoveredPoint.x
      const tooltipY = hoveredPoint.y

      // Tooltip background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(tooltipX - 80, tooltipY - 60, 160, 50)
      
      // Tooltip text
      ctx.fillStyle = 'white'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(point.period, tooltipX, tooltipY - 40)
      ctx.fillText(`Volume: ${point.volume.toFixed(1)} MT`, tooltipX, tooltipY - 25)
      ctx.fillText(`Revenue: ₹${point.revenue.toFixed(1)}L`, tooltipX, tooltipY - 10)
    }

  }, [data, loading, animationProgress, hoveredPoint, mode, height])

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data.length) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const padding = { top: 20, right: 60, bottom: 60, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const xStep = chartWidth / (data.length - 1)

    // Find closest data point
    const dataIndex = Math.round((x - padding.left) / xStep)
    
    if (dataIndex >= 0 && dataIndex < data.length) {
      setHoveredPoint({ index: dataIndex, x, y })
    } else {
      setHoveredPoint(null)
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Try adjusting your date range or filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Chart */}
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full cursor-crosshair"
        style={{ height: `${height}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6">
        {(mode === 'volume' || mode === 'both') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Volume (MT)</span>
          </div>
        )}
        {(mode === 'revenue' || mode === 'both') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Revenue (₹L)</span>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Volume Change</div>
            <div className={`text-lg font-semibold ${
              insights.trend === 'up' ? 'text-green-600' : 
              insights.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {insights.volumeChange}%
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Revenue Change</div>
            <div className={`text-lg font-semibold ${
              parseFloat(insights.revenueChange) > 0 ? 'text-green-600' : 
              parseFloat(insights.revenueChange) < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {insights.revenueChange}%
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Deal Change</div>
            <div className={`text-lg font-semibold ${
              parseFloat(insights.dealChange) > 0 ? 'text-green-600' : 
              parseFloat(insights.dealChange) < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {insights.dealChange}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}