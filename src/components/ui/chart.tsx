"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, { label: string; color: string }>
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-[350px] w-full", className)}
      style={
        {
          "--color-desktop": config?.desktop?.color,
          "--color-mobile": config?.mobile?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps {
  children: React.ReactNode
  cursor?: boolean
  content?: React.ReactNode
}

const ChartTooltip = ({ children, cursor = true, content }: ChartTooltipProps) => {
  return React.cloneElement(children as React.ReactElement, {
    cursor,
    content,
  })
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color: string
  }>
  label?: string
  indicator?: "dashed" | "solid"
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ active, payload, label, indicator = "solid" }, ref) => {
  if (!active || !payload) return null

  return (
    <div
      ref={ref}
      className="rounded-lg border bg-background p-2 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
          <span className="font-bold text-muted-foreground">
            {payload[0]?.value}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {payload[1]?.dataKey}
          </span>
          <span className="font-bold">
            {payload[1]?.value}
          </span>
        </div>
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
