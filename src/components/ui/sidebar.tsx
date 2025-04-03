
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
 
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
 
interface SidebarContextProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  horizontalCollapsed: boolean
  setHorizontalCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}
 
const SidebarContext = React.createContext<SidebarContextProps>({
  collapsed: false,
  setCollapsed: () => undefined,
  horizontalCollapsed: false,
  setHorizontalCollapsed: () => undefined,
})
 
interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  defaultHorizontalCollapsed?: boolean
  collapsed?: boolean
  horizontalCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onHorizontalCollapsedChange?: (horizontalCollapsed: boolean) => void
}
 
export function SidebarProvider({
  children,
  defaultCollapsed = false,
  defaultHorizontalCollapsed = false,
  collapsed: controlledCollapsed,
  horizontalCollapsed: controlledHorizontalCollapsed,
  onCollapsedChange,
  onHorizontalCollapsedChange,
}: SidebarProviderProps) {
  const [_collapsed, _setCollapsed] = React.useState(defaultCollapsed)
  const [_horizontalCollapsed, _setHorizontalCollapsed] = React.useState(
    defaultHorizontalCollapsed
  )
 
  const collapsed = controlledCollapsed ?? _collapsed
  const horizontalCollapsed =
    controlledHorizontalCollapsed ?? _horizontalCollapsed
 
  const setCollapsed = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const resolvedValue =
        typeof value === "function" ? value(collapsed) : value
      _setCollapsed(resolvedValue)
      onCollapsedChange?.(resolvedValue)
    },
    [_setCollapsed, collapsed, onCollapsedChange]
  )
 
  const setHorizontalCollapsed = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const resolvedValue =
        typeof value === "function" ? value(horizontalCollapsed) : value
      _setHorizontalCollapsed(resolvedValue)
      onHorizontalCollapsedChange?.(resolvedValue)
    },
    [_setHorizontalCollapsed, horizontalCollapsed, onHorizontalCollapsedChange]
  )
 
  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        horizontalCollapsed,
        setHorizontalCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
 
export const useSidebar = () => {
  const context = React.useContext(SidebarContext)
 
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
 
  return context
}
 
const sidebarVariants = cva(
  "relative flex flex-col h-screen bg-background border-r gap-4 transition-all duration-300 ease-in-out",
  {
    variants: {
      size: {
        sm: "w-12",
        md: "w-64",
        lg: "w-72",
      },
      collapsed: {
        true: "w-16",
      },
    },
    defaultVariants: { size: "md", collapsed: false },
  }
)
 
interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}
 
export function Sidebar({
  className,
  size,
  collapsed,
  ...props
}: SidebarProps) {
  const { collapsed: contextCollapsed } = useSidebar()
 
  return (
    <aside
      data-collapsed={collapsed ?? contextCollapsed}
      className={cn(
        sidebarVariants({ size, collapsed: collapsed ?? contextCollapsed }),
        className
      )}
      {...props}
    />
  )
}
 
const sidebarHeaderVariants = cva(
  "flex h-16 items-center border-b gap-4 px-3.5 py-4",
  {
    variants: {
      collapsed: {
        true: "justify-center",
        false: "justify-between",
      },
    },
    defaultVariants: { collapsed: false },
  }
)
 
interface SidebarHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarHeaderVariants> {}
 
export function SidebarHeader({
  className,
  collapsed,
  ...props
}: SidebarHeaderProps) {
  const { collapsed: contextCollapsed, setCollapsed } = useSidebar()
  const isSmallScreen = useMediaQuery("(max-width: 768px)")
 
  return (
    <header
      data-collapsed={collapsed ?? contextCollapsed}
      className={cn(
        sidebarHeaderVariants({ collapsed: collapsed ?? contextCollapsed }),
        className
      )}
      {...props}
    >
      {props.children}
      {!isSmallScreen && !props.children ? (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setCollapsed(!contextCollapsed)}
        >
          {contextCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      ) : null}
    </header>
  )
}
 
export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-auto px-3.5 py-2", className)} {...props} />
}
 
export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <footer
      className={cn("mt-auto border-t px-3.5 py-4", className)}
      {...props}
    />
  )
}
 
export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-1 py-1", className)}
      {...props}
    />
  )
}
 
export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar()
 
  if (collapsed) {
    return null
  }
 
  return (
    <div
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}
 
export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-2", className)} {...props} />
}
 
const sidebarMenuButtonVariants = cva(
  "group inline-flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "",
        ghost: "hover:bg-transparent hover:text-accent-foreground",
      },
      active: {
        true: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        false: "transparent",
      },
      size: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11",
      },
      collapsed: {
        true: "justify-center",
        false: "justify-start",
      },
    },
    defaultVariants: {
      variant: "default",
      active: false,
      size: "default",
      collapsed: false,
    },
  }
)
 
export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
}
 
export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      className,
      variant,
      active,
      size,
      collapsed,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const { collapsed: contextCollapsed } = useSidebar()
    const Comp = asChild ? React.Fragment : "button"
    
    const buttonProps = asChild
      ? { className: cn(sidebarMenuButtonVariants({ variant, active, size, collapsed: collapsed ?? contextCollapsed }), className) }
      : { className: cn(sidebarMenuButtonVariants({ variant, active, size, collapsed: collapsed ?? contextCollapsed }), className), ref, ...props }
 
    return <Comp {...buttonProps} />
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"
 
export interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  label?: string
  action?: React.ReactNode
  withBackground?: boolean
}
 
export function SidebarMenuItem({
  className,
  icon,
  title,
  label,
  action,
  withBackground = true,
  ...props
}: SidebarMenuItemProps) {
  const { collapsed } = useSidebar()
 
  return (
    <div className={cn("relative", className)} {...props} />
  )
}
 
export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}
 
export function SidebarSection({
  className,
  title,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string
}) {
  const { collapsed } = useSidebar()
 
  return (
    <div
      className={cn("pb-6", className)}
      {...props}
    >
      {title && !collapsed && (
        <div className="mb-2 px-4 text-xs font-semibold tracking-tight">
          {title}
        </div>
      )}
      {props.children}
    </div>
  )
}
 
export interface SidebarTriggerProps {
  onBlur?: () => void
  onFocus?: () => void
  onClick?: () => void
  label?: string
}
 
export function SidebarTrigger({
  onBlur,
  onFocus,
  onClick,
  label = "Toggle Sidebar",
}: SidebarTriggerProps) {
  const { horizontalCollapsed, setHorizontalCollapsed } = useSidebar()
  const isSmallScreen = useMediaQuery("(max-width: 768px)")
 
  if (!isSmallScreen) {
    return null
  }
 
  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute left-4 top-4 h-9 w-9 z-40"
      onClick={() => {
        setHorizontalCollapsed(!horizontalCollapsed)
        onClick?.()
      }}
      onBlur={onBlur}
      onFocus={onFocus}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
