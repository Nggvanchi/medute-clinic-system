"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        className="size-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm"
        aria-label="Toggle theme"
      >
        <Sun className="size-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-zinc-600" />}
    </button>
  )
}
