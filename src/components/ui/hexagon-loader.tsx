"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon } from 'lucide-react'


export default function HexagonLoader({ size = 80, className = "" }: { size?: number; className?: string }) {
    const strokeWidth = 8
    const outerRadius = Number(((size - strokeWidth) / 2).toFixed(2))
    const innerRadius = Number((size / 5).toFixed(2))

    const createHexagonPath = (radius: number, centerX: number, centerY: number) => {
        const points = []
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)
            // Round to 2 decimal places to ensure consistency between server and client
            points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
        }
        return `M ${points.join(' L ')} Z`
    }

    const center = Number((size / 2).toFixed(2))
    const outerPath = createHexagonPath(outerRadius, center, center)
    const innerPath = createHexagonPath(innerRadius, center, center)

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 rounded-full opacity-20 dark:opacity-30 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-blue-500/30 blur-[10px] animate-pulse" />

                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="relative z-10"
                >
                    <defs>
                        <filter id={`glow-${size}`}>
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <path
                        d={outerPath}
                        fill="none"
                        className="stroke-slate-900 dark:stroke-white transition-colors duration-300"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#glow-${size})`}
                        style={{
                            transformOrigin: 'center',
                            animation: 'hexagonMorph 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite'
                        }}
                    />

                    <path
                        d={innerPath}
                        className="fill-purple-600 dark:fill-purple-400 transition-colors duration-300"
                        filter={`url(#glow-${size})`}
                        style={{
                            transformOrigin: 'center',
                            animation: 'innerHexagonForm 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.8s both'
                        }}
                    />
                </svg>
            </div>

            <style jsx>{`
        @keyframes hexagonMorph {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
            stroke-width: 2;
          }
          30% {
            opacity: 0.6;
            transform: scale(0.3) rotate(60deg);
            stroke-width: 12;
          }
          60% {
            opacity: 0.9;
            transform: scale(0.8) rotate(120deg);
            stroke-width: 8;
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
            stroke-width: ${strokeWidth};
          }
        }
        
        @keyframes innerHexagonForm {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
            filter: blur(10px);
          }
          40% {
            opacity: 0.3;
            transform: scale(0.2) rotate(-90deg);
            filter: blur(5px);
          }
          70% {
            opacity: 0.7;
            transform: scale(0.6) rotate(-30deg);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }
      `}</style>
        </div>
    )
}