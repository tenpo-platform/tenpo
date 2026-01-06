"use client"

import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

// Navigation structure
const navigation = [
  {
    id: "basic",
    title: "Basic",
    items: [
      { id: "typography", title: "Typography" },
      { id: "colors", title: "Colors" },
    ],
  },
  {
    id: "styling",
    title: "Styling",
    items: [
      { id: "border-radius", title: "Border Radius" },
      { id: "spacing", title: "Spacing Scale" },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    items: [
      { id: "buttons", title: "Buttons" },
      { id: "badges", title: "Badges" },
    ],
  },
  {
    id: "forms",
    title: "Forms",
    items: [
      { id: "form-elements", title: "Form Elements" },
      { id: "slider", title: "Slider" },
      { id: "calendar", title: "Calendar" },
      { id: "form-validation", title: "Form Validation" },
    ],
  },
  {
    id: "data-display",
    title: "Data Display",
    items: [
      { id: "cards", title: "Cards" },
      { id: "table", title: "Table" },
      { id: "tabs", title: "Tabs" },
      { id: "accordion", title: "Accordion" },
      { id: "avatars", title: "Avatars" },
      { id: "progress", title: "Progress" },
      { id: "skeleton", title: "Skeleton" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    items: [
      { id: "pagination", title: "Pagination" },
      { id: "breadcrumb", title: "Breadcrumb" },
      { id: "command", title: "Command" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback",
    items: [
      { id: "alerts", title: "Alerts" },
      { id: "toast", title: "Toast" },
    ],
  },
  {
    id: "overlays",
    title: "Overlays",
    items: [
      { id: "dialogs", title: "Dialogs" },
      { id: "alert-dialog", title: "Alert Dialog" },
      { id: "sheet", title: "Sheet" },
      { id: "dropdown-menu", title: "Dropdown Menu" },
      { id: "tooltip", title: "Tooltip" },
      { id: "popover", title: "Popover" },
    ],
  },
]

// Get all section IDs for scroll tracking
const allSectionIds = navigation.flatMap(section => [
  section.id,
  ...section.items.map(item => item.id),
])

// Icons
function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 7V10.5M10 13.5V13M8.66 3.5L2.1 15A1.5 1.5 0 003.44 17.25H16.56A1.5 1.5 0 0017.9 15L11.34 3.5A1.5 1.5 0 008.66 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6.5 10L9 12.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6.5V10.5M10 13.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 9V14M10 6.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MoreHorizontal({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <circle cx="12" cy="8" r="1" fill="currentColor"/>
      <circle cx="4" cy="8" r="1" fill="currentColor"/>
    </svg>
  )
}

// Form schema
const formSchema = z.object({
  childName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  age: z.string().min(1, "Please select an age group"),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
})

// Sidebar Navigation Component
function SidebarNav({ activeSection }: { activeSection: string }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 })
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!navRef.current) return
    const activeLink = navRef.current.querySelector(`[data-section="${activeSection}"]`) as HTMLElement
    if (activeLink) {
      setIndicatorStyle({
        top: activeLink.offsetTop,
        height: activeLink.offsetHeight,
      })
    }
  }, [activeSection])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 32
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <nav ref={navRef} className="relative">
      {/* Vertical track */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted rounded-full" />

      {/* Active indicator */}
      <div
        className="absolute left-0 w-0.5 bg-primary rounded-full transition-all duration-200"
        style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
      />

      <div className="pl-4 space-y-4">
        {navigation.map((section) => (
          <div key={section.id}>
            <button
              data-section={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "text-subtitle2 font-medium transition-colors block py-1",
                activeSection === section.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {section.title}
            </button>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  data-section={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "text-caption block py-1 transition-colors",
                    activeSection === item.id
                      ? "text-primary"
                      : "text-muted-foreground/70 hover:text-foreground"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}

// Color Swatch Component
function ColorSwatch({ name, className, textClass }: { name: string; className: string; textClass: string }) {
  return (
    <div className={`${className} p-4 rounded-md`}>
      <p className={`text-caption font-medium ${textClass}`}>{name}</p>
    </div>
  )
}

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-4">
      <div>
        <p className="text-caption text-muted-foreground mb-4">Click a date to select</p>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border bg-card"
        />
      </div>
      {date && (
        <p className="text-body2 text-muted-foreground">
          Selected: <span className="text-foreground font-medium">{date.toLocaleDateString()}</span>
        </p>
      )}
    </div>
  )
}

export default function DesignSystemDemo() {
  const [activeSection, setActiveSection] = useState("basic")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      email: "",
      age: "",
      terms: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  // Scroll spy - find section closest to top of viewport
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 100 // Offset for better UX

      let currentSection = "basic"

      // Find the section that's currently at the top of the viewport
      for (const id of allSectionIds) {
        const element = document.getElementById(id)
        if (!element) continue

        const rect = element.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY

        if (elementTop <= scrollY) {
          currentSection = id
        } else {
          break
        }
      }

      setActiveSection(currentSection)
    }

    // Run once on mount
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-56 border-r bg-background p-6 overflow-y-auto hidden lg:block">
        <div className="mb-8">
          <Image
            src="/images/logo/wordmark/wordmark-light.svg"
            alt="Tenpo"
            width={120}
            height={42}
          />
          <p className="text-caption text-muted-foreground mt-1">Design System</p>
        </div>
        <SidebarNav activeSection={activeSection} />
      </aside>

      {/* Main content */}
      <main className="lg:pl-56">
        <div className="max-w-5xl mx-auto p-8 md:p-16 space-y-16">
          {/* Header */}
          <header>
            <Image
              src="/images/logo/wordmark/wordmark-light.svg"
              alt="Tenpo"
              width={200}
              height={70}
              className="mb-2"
            />
            <p className="text-h5 text-muted-foreground mt-2">Design System Demo</p>
          </header>

          {/* ==================== BASIC ==================== */}
          <section id="basic">
            <h2 className="text-h3 mb-8 text-primary">Basic</h2>
            <p className="text-body1 text-muted-foreground mb-8">Foundational elements: typography and color palette.</p>
          </section>

          {/* Typography */}
          <section id="typography">
            <h3 className="text-h4 mb-8">Typography</h3>

            <div className="space-y-8">
              <div>
                <p className="text-caption text-muted-foreground mb-2">Host Grotesk (Primary)</p>
                <div className="space-y-4">
                  <p className="text-h1">H1 — 96px</p>
                  <p className="text-h2">H2 — 60px</p>
                  <p className="text-h3">H3 — 48px</p>
                  <p className="text-h4">H4 — 34px</p>
                  <p className="text-h5">H5 — 24px</p>
                  <p className="text-h6">H6 — 20px Medium</p>
                  <p className="text-subtitle1">Subtitle 1 — 16px</p>
                  <p className="text-subtitle2">Subtitle 2 — 14px</p>
                  <p className="text-body1">Body 1 — 16px regular for longer paragraphs and content blocks.</p>
                  <p className="text-body2">Body 2 — 14px for secondary content and smaller text.</p>
                  <p className="text-caption">Caption — 12px for labels and metadata</p>
                  <p className="text-overline">Overline — 12px uppercase</p>
                </div>
              </div>

              <div>
                <p className="text-caption text-muted-foreground mb-2">Seriously Nostalgic (Display)</p>
                <p className="font-display text-h1">Display H1</p>
                <p className="font-display text-h2">Display H2</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Colors */}
          <section id="colors">
            <h3 className="text-h4 mb-8">Colors</h3>

            {/* Core */}
            <div className="mb-8">
              <p className="text-subtitle2 font-medium mb-2">Core — Page structure</p>
              <p className="text-caption text-muted-foreground mb-4">Base colors for layouts and surfaces</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="background" className="bg-background border" textClass="text-foreground" />
                <ColorSwatch name="foreground" className="bg-foreground" textClass="text-background" />
                <ColorSwatch name="card" className="bg-card border" textClass="text-card-foreground" />
                <ColorSwatch name="muted" className="bg-muted" textClass="text-muted-foreground" />
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8">
              <p className="text-subtitle2 font-medium mb-2">Actions — Buttons & interactive</p>
              <p className="text-caption text-muted-foreground mb-4">Primary for main CTA, Secondary/Tertiary for supporting actions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="primary" className="bg-primary" textClass="text-primary-foreground" />
                <ColorSwatch name="secondary" className="bg-secondary" textClass="text-secondary-foreground" />
                <ColorSwatch name="tertiary" className="bg-tertiary" textClass="text-tertiary-foreground" />
                <ColorSwatch name="destructive" className="bg-destructive" textClass="text-destructive-foreground" />
              </div>
            </div>

            {/* Accents */}
            <div className="mb-8">
              <p className="text-subtitle2 font-medium mb-2">Accents — Highlights & emphasis</p>
              <p className="text-caption text-muted-foreground mb-4">Bold colors for emphasis, tags, badges, or decorative elements</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="accent" className="bg-accent" textClass="text-accent-foreground" />
                <ColorSwatch name="accent-2" className="bg-accent-2" textClass="text-accent-2-foreground" />
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <p className="text-subtitle2 font-medium mb-2">Status — Feedback & alerts</p>
              <p className="text-caption text-muted-foreground mb-4">Icons use main color, backgrounds use muted variant</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="success" className="bg-success" textClass="text-white" />
                <ColorSwatch name="success-muted" className="bg-success-muted" textClass="text-success-foreground" />
                <ColorSwatch name="warning" className="bg-warning" textClass="text-white" />
                <ColorSwatch name="warning-muted" className="bg-warning-muted" textClass="text-warning-foreground" />
                <ColorSwatch name="error" className="bg-error" textClass="text-white" />
                <ColorSwatch name="error-muted" className="bg-error-muted" textClass="text-error-foreground" />
                <ColorSwatch name="info" className="bg-info" textClass="text-white" />
                <ColorSwatch name="info-muted" className="bg-info-muted" textClass="text-info-foreground" />
              </div>
            </div>

            {/* Brand Aliases */}
            <div>
              <p className="text-subtitle2 font-medium mb-2">Brand Aliases — Raw palette</p>
              <p className="text-caption text-muted-foreground mb-4">Direct brand colors (prefer semantic tokens above)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="pitch-green" className="bg-pitch-green" textClass="text-white" />
                <ColorSwatch name="obsidian" className="bg-obsidian" textClass="text-white" />
                <ColorSwatch name="chalk" className="bg-chalk" textClass="text-obsidian" />
                <ColorSwatch name="sand" className="bg-sand" textClass="text-white" />
                <ColorSwatch name="steel" className="bg-steel" textClass="text-obsidian" />
                <ColorSwatch name="mist" className="bg-mist" textClass="text-obsidian" />
                <ColorSwatch name="vapor" className="bg-vapor" textClass="text-obsidian" />
                <ColorSwatch name="cloud" className="bg-cloud" textClass="text-obsidian" />
                <ColorSwatch name="day" className="bg-day" textClass="text-obsidian" />
                <ColorSwatch name="midnight" className="bg-midnight" textClass="text-white" />
                <ColorSwatch name="carbon" className="bg-carbon" textClass="text-white" />
              </div>
            </div>
          </section>

          <Separator />

          {/* ==================== STYLING ==================== */}
          <section id="styling">
            <h2 className="text-h3 mb-8 text-primary">Styling</h2>
            <p className="text-body1 text-muted-foreground mb-8">Border radius, spacing, and visual treatment conventions.</p>
          </section>

          {/* Border Radius */}
          <section id="border-radius">
            <h3 className="text-h4 mb-8">Border Radius</h3>

            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-sm" />
                <p className="text-caption mt-2">sm (12px)</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-md" />
                <p className="text-caption mt-2">md (24px)</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-lg" />
                <p className="text-caption mt-2">lg (32px)</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-xl" />
                <p className="text-caption mt-2">xl (36px)</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full" />
                <p className="text-caption mt-2">full</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Spacing */}
          <section id="spacing">
            <h3 className="text-h4 mb-8">Spacing Scale</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-primary p-2 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-2 (8px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-4 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-4 (16px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-6 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-6 (24px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-8 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-8 (32px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-10 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-10 (40px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-12 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-12 (48px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-14 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-14 (56px)</p>
              </div>
              <div className="text-center">
                <div className="bg-primary p-16 inline-block"><div className="bg-primary-foreground w-6 h-6" /></div>
                <p className="text-caption text-muted-foreground mt-2">p-16 (64px)</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* ==================== ACTIONS ==================== */}
          <section id="actions">
            <h2 className="text-h3 mb-8 text-primary">Actions</h2>
            <p className="text-body1 text-muted-foreground mb-8">Interactive elements for user actions.</p>
          </section>

          {/* Buttons */}
          <section id="buttons">
            <h3 className="text-h4 mb-8">Buttons</h3>

            <p className="text-caption text-muted-foreground mb-4">
              Hover: 90% opacity • Focus: orange ring • Pill shape
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-caption text-muted-foreground mb-4">Default size with icons</p>
                <div className="flex flex-wrap gap-4">
                  <Button>
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                  <Button variant="secondary">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                  <Button variant="tertiary">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                  <Button variant="ghost">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-caption text-muted-foreground mb-4">Small size with icons</p>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                  <Button variant="secondary" size="sm">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                  <Button variant="tertiary" size="sm">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft /> Book a Demo <ArrowRight />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-caption text-muted-foreground mb-4">Default size, icon hidden</p>
                <div className="flex flex-wrap gap-4">
                  <Button>Book a Demo</Button>
                  <Button variant="secondary">Book a Demo</Button>
                  <Button variant="tertiary">Book a Demo</Button>
                  <Button variant="ghost">Book a Demo</Button>
                </div>
              </div>

              <div>
                <p className="text-caption text-muted-foreground mb-4">Small size, icon hidden</p>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Book a Demo</Button>
                  <Button variant="secondary" size="sm">Book a Demo</Button>
                  <Button variant="tertiary" size="sm">Book a Demo</Button>
                  <Button variant="ghost" size="sm">Book a Demo</Button>
                </div>
              </div>

              <div>
                <p className="text-caption text-muted-foreground mb-4">Icon only</p>
                <div className="flex flex-wrap gap-4">
                  <Button size="icon"><MenuIcon /></Button>
                  <Button variant="secondary" size="icon"><MenuIcon /></Button>
                  <Button variant="tertiary" size="icon"><MenuIcon /></Button>
                  <Button variant="ghost" size="icon"><MenuIcon /></Button>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Badges */}
          <section id="badges">
            <h3 className="text-h4 mb-8">Badges</h3>

            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Badge className="bg-success text-white">Success</Badge>
              <Badge className="bg-warning text-white">Warning</Badge>
              <Badge className="bg-error text-white">Error</Badge>
              <Badge className="bg-info text-white">Info</Badge>
            </div>
          </section>

          <Separator />

          {/* ==================== FORMS ==================== */}
          <section id="forms">
            <h2 className="text-h3 mb-8 text-primary">Forms</h2>
            <p className="text-body1 text-muted-foreground mb-8">Input components for data entry and form handling.</p>
          </section>

          {/* Form Elements */}
          <section id="form-elements">
            <h3 className="text-h4 mb-8">Form Elements</h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Text Inputs */}
              <div className="space-y-4">
                <p className="text-caption text-muted-foreground">Text Inputs</p>
                <div className="space-y-1.5">
                  <Label htmlFor="input-demo">Input</Label>
                  <Input id="input-demo" placeholder="Enter your name..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="textarea-demo">Textarea</Label>
                  <Textarea id="textarea-demo" placeholder="Write a message..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Disabled Input</Label>
                  <Input disabled placeholder="Disabled" />
                </div>
              </div>

              {/* Select */}
              <div className="space-y-4">
                <p className="text-caption text-muted-foreground">Select / Dropdown</p>
                <div className="space-y-1.5">
                  <Label>Camp Type</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a camp type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Camp</SelectItem>
                      <SelectItem value="overnight">Overnight Camp</SelectItem>
                      <SelectItem value="weekend">Weekend Camp</SelectItem>
                      <SelectItem value="week">Week-long Camp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Age Group</Label>
                  <Select defaultValue="8-10">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-7">5-7 years</SelectItem>
                      <SelectItem value="8-10">8-10 years</SelectItem>
                      <SelectItem value="11-13">11-13 years</SelectItem>
                      <SelectItem value="14+">14+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <p className="text-caption text-muted-foreground">Checkboxes</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="font-normal">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="newsletter" defaultChecked />
                    <Label htmlFor="newsletter" className="font-normal">Subscribe to newsletter</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="disabled-check" disabled />
                    <Label htmlFor="disabled-check" className="font-normal">Disabled checkbox</Label>
                  </div>
                </div>
              </div>

              {/* Radio Buttons */}
              <div className="space-y-4">
                <p className="text-caption text-muted-foreground">Radio Buttons</p>
                <RadioGroup defaultValue="option-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-1" id="option-1" />
                    <Label htmlFor="option-1" className="font-normal">Morning session (9am-12pm)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-2" id="option-2" />
                    <Label htmlFor="option-2" className="font-normal">Afternoon session (1pm-4pm)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-3" id="option-3" />
                    <Label htmlFor="option-3" className="font-normal">Full day (9am-4pm)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <p className="text-caption text-muted-foreground">Switches</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications" className="font-normal">Email notifications</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="marketing" defaultChecked />
                    <Label htmlFor="marketing" className="font-normal">Marketing emails</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="disabled-switch" disabled />
                    <Label htmlFor="disabled-switch" className="font-normal">Disabled switch</Label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Slider */}
          <section id="slider">
            <h3 className="text-h4 mb-8">Slider</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Range inputs • Uses primary color for active range
            </p>

            <div className="space-y-8 max-w-md">
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider defaultValue={[100, 400]} max={500} step={10} />
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>$0</span>
                  <span>$500</span>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Age Range</Label>
                <Slider defaultValue={[8, 12]} min={5} max={14} step={1} />
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>5 years</span>
                  <span>14 years</span>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Single Value</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Calendar */}
          <section id="calendar">
            <h3 className="text-h4 mb-8">Calendar</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Date picker • Selected date uses primary (Pitch Green) • Hover uses secondary (Day cream) • Today highlighted
            </p>

            <div className="flex flex-wrap gap-8">
              <CalendarDemo />
            </div>
          </section>

          <Separator />

          {/* Form with Validation */}
          <section id="form-validation">
            <h3 className="text-h4 mb-8">Form with Validation</h3>

            <p className="text-caption text-muted-foreground mb-6">
              React Hook Form + Zod validation • Try submitting empty
            </p>

            <div className="max-w-md">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child&apos;s Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter child's name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name that will appear on their camp badge.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Email</FormLabel>
                        <FormControl>
                          <Input placeholder="parent@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          We&apos;ll send confirmation and updates here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5-7">5-7 years</SelectItem>
                            <SelectItem value="8-10">8-10 years</SelectItem>
                            <SelectItem value="11-13">11-13 years</SelectItem>
                            <SelectItem value="14+">14+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Accept terms and conditions
                          </FormLabel>
                          <FormDescription>
                            You agree to our Terms of Service and Privacy Policy.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Register</Button>
                </form>
              </Form>
            </div>
          </section>

          <Separator />

          {/* ==================== DATA DISPLAY ==================== */}
          <section id="data-display">
            <h2 className="text-h3 mb-8 text-primary">Data Display</h2>
            <p className="text-body1 text-muted-foreground mb-8">Components for presenting information and content.</p>
          </section>

          {/* Cards */}
          <section id="cards">
            <h3 className="text-h4 mb-8">Cards</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Soccer Skills Camp</CardTitle>
                  <CardDescription>Build fundamental soccer techniques in a fun, supportive environment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Ages:</span> 8-10 years</p>
                    <p><span className="text-muted-foreground">Duration:</span> 1 week</p>
                    <p><span className="text-muted-foreground">Price:</span> $299</p>
                  </div>
                </CardContent>
                <CardFooter className="gap-3">
                  <Button variant="secondary" className="flex-1">Learn More</Button>
                  <Button className="flex-1">Register</Button>
                </CardFooter>
              </Card>

              {/* Card with Image placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Basketball Basics</CardTitle>
                  <CardDescription>Master dribbling, shooting, and teamwork skills.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-sm h-32 flex items-center justify-center text-muted-foreground text-sm">
                    Image placeholder
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Table */}
          <section id="table">
            <h3 className="text-h4 mb-8">Table</h3>

            <div className="bg-card rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Camp</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Soccer Skills</TableCell>
                    <TableCell>8-10 years</TableCell>
                    <TableCell>1 week</TableCell>
                    <TableCell className="text-right">$299</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Basketball Basics</TableCell>
                    <TableCell>11-13 years</TableCell>
                    <TableCell>2 weeks</TableCell>
                    <TableCell className="text-right">$549</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Multi-Sport</TableCell>
                    <TableCell>5-7 years</TableCell>
                    <TableCell>3 days</TableCell>
                    <TableCell className="text-right">$149</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <Separator />

          {/* Tabs */}
          <section id="tabs">
            <h3 className="text-h4 mb-8">Tabs</h3>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="bg-card rounded-lg p-6 border">
                  <p className="text-body1">Welcome to the camp overview. Here you&apos;ll find all the essential information about what makes our programs special.</p>
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="mt-4">
                <div className="bg-card rounded-lg p-6 border">
                  <p className="text-body1">View the daily schedule, activity timings, and important dates for upcoming sessions.</p>
                </div>
              </TabsContent>
              <TabsContent value="pricing" className="mt-4">
                <div className="bg-card rounded-lg p-6 border">
                  <p className="text-body1">Check our competitive pricing options, discounts for siblings, and early bird specials.</p>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <Separator />

          {/* Accordion */}
          <section id="accordion">
            <h3 className="text-h4 mb-8">Accordion</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Collapsible content sections • Great for FAQs
            </p>

            <Accordion type="single" collapsible className="max-w-lg">
              <AccordionItem value="item-1">
                <AccordionTrigger>What ages are your camps for?</AccordionTrigger>
                <AccordionContent>
                  Our camps are designed for children ages 5-14. We group participants by age to ensure appropriate skill levels and social dynamics.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What should my child bring?</AccordionTrigger>
                <AccordionContent>
                  Please bring a water bottle, sunscreen, comfortable athletic clothing, and appropriate footwear. Lunch is provided for full-day camps.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What is your refund policy?</AccordionTrigger>
                <AccordionContent>
                  Full refunds are available up to 14 days before camp starts. Within 14 days, we offer a 50% refund or credit toward a future camp.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Do you offer sibling discounts?</AccordionTrigger>
                <AccordionContent>
                  Yes! We offer 10% off for the second sibling and 15% off for additional siblings registered for the same camp session.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <Separator />

          {/* Avatars */}
          <section id="avatars">
            <h3 className="text-h4 mb-8">Avatars</h3>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <Avatar className="size-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-caption text-muted-foreground mt-2">Small</p>
              </div>
              <div className="text-center">
                <Avatar className="size-10">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-caption text-muted-foreground mt-2">Medium</p>
              </div>
              <div className="text-center">
                <Avatar className="size-14">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-caption text-muted-foreground mt-2">Large</p>
              </div>
              <div className="text-center">
                <Avatar className="size-10">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-caption text-muted-foreground mt-2">Fallback</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Progress */}
          <section id="progress">
            <h3 className="text-h4 mb-8">Progress</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Visual progress indicators • Uses primary color
            </p>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile completion</span>
                  <span className="text-muted-foreground">25%</span>
                </div>
                <Progress value={25} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Registration steps</span>
                  <span className="text-muted-foreground">60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Camp capacity</span>
                  <span className="text-muted-foreground">90%</span>
                </div>
                <Progress value={90} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Skeleton */}
          <section id="skeleton">
            <h3 className="text-h4 mb-8">Skeleton</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Loading placeholders
            </p>

            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </section>

          <Separator />

          {/* ==================== NAVIGATION ==================== */}
          <section id="navigation">
            <h2 className="text-h3 mb-8 text-primary">Navigation</h2>
            <p className="text-body1 text-muted-foreground mb-8">Components for navigating through content and pages.</p>
          </section>

          {/* Pagination */}
          <section id="pagination">
            <h3 className="text-h4 mb-8">Pagination</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Navigate through paginated content • Active page uses primary color
            </p>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">10</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </section>

          <Separator />

          {/* Breadcrumb */}
          <section id="breadcrumb">
            <h3 className="text-h4 mb-8">Breadcrumb</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Navigation hierarchy • Current page is not clickable
            </p>

            <div className="space-y-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Camps</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Soccer Skills</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Profile</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Edit</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </section>

          <Separator />

          {/* Command */}
          <section id="command">
            <h3 className="text-h4 mb-8">Command</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Command palette for quick actions • Press ⌘K to open (demo below)
            </p>

            <div className="max-w-md">
              <Command className="rounded-lg border shadow-sm">
                <CommandInput placeholder="Search camps, sports, locations..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggested">
                    <CommandItem>
                      <span>Soccer Skills Camp</span>
                      <CommandShortcut>Ages 8-10</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                      <span>Basketball Basics</span>
                      <CommandShortcut>Ages 11-13</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                      <span>Multi-Sport Adventure</span>
                      <CommandShortcut>Ages 5-7</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Quick Actions">
                    <CommandItem>
                      <span>Register for Camp</span>
                    </CommandItem>
                    <CommandItem>
                      <span>View Schedule</span>
                    </CommandItem>
                    <CommandItem>
                      <span>Contact Support</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </section>

          <Separator />

          {/* ==================== FEEDBACK ==================== */}
          <section id="feedback">
            <h2 className="text-h3 mb-8 text-primary">Feedback</h2>
            <p className="text-body1 text-muted-foreground mb-8">Components for user notifications and status messages.</p>
          </section>

          {/* Alerts */}
          <section id="alerts">
            <h3 className="text-h4 mb-8">Alerts</h3>

            <p className="text-caption text-muted-foreground mb-4">
              Icon left • Title + Description (80% opacity) • No visible border
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-warning-muted">
                <WarningIcon className="text-warning shrink-0" />
                <div>
                  <p className="font-medium text-warning-foreground">Warning</p>
                  <p className="text-warning-foreground/80 text-sm">Only 3 spots remaining for this camp.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-success-muted">
                <SuccessIcon className="text-success shrink-0" />
                <div>
                  <p className="font-medium text-success-foreground">Success!</p>
                  <p className="text-success-foreground/80 text-sm">Your registration has been confirmed.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-error-muted">
                <ErrorIcon className="text-error shrink-0" />
                <div>
                  <p className="font-medium text-error-foreground">Error</p>
                  <p className="text-error-foreground/80 text-sm">Something went wrong. Please try again.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-info-muted">
                <InfoIcon className="text-info shrink-0" />
                <div>
                  <p className="font-medium text-info-foreground">Information</p>
                  <p className="text-info-foreground/80 text-sm">Registration opens on Monday at 9am.</p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Toast */}
          <section id="toast">
            <h3 className="text-h4 mb-8">Toast</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Non-blocking notifications • Click buttons to trigger
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="secondary"
                onClick={() => toast("Registration saved", {
                  description: "Your progress has been saved automatically.",
                })}
              >
                Default Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.success("Registration complete!", {
                  description: "You will receive a confirmation email shortly.",
                })}
              >
                Success Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.error("Registration failed", {
                  description: "Please check your information and try again.",
                })}
              >
                Error Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.warning("Session expiring", {
                  description: "Your session will expire in 5 minutes.",
                })}
              >
                Warning Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.info("New camps available", {
                  description: "Check out our summer 2025 programs.",
                })}
              >
                Info Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: "Submitting registration...",
                    success: "Registration submitted!",
                    error: "Failed to submit",
                  }
                )}
              >
                Promise Toast
              </Button>
            </div>
          </section>

          <Separator />

          {/* ==================== OVERLAYS ==================== */}
          <section id="overlays">
            <h2 className="text-h3 mb-8 text-primary">Overlays</h2>
            <p className="text-body1 text-muted-foreground mb-8">Modal dialogs, sheets, and popup components.</p>
          </section>

          {/* Dialogs */}
          <section id="dialogs">
            <h3 className="text-h4 mb-8">Dialogs</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Cancel + Continue button patterns • Click to open
            </p>

            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Registration</DialogTitle>
                    <DialogDescription>
                      You are about to register for Soccer Skills Camp. This will reserve your spot and send a confirmation email.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button>Continue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Dialog with Form</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="john@example.com" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          <Separator />

          {/* Alert Dialog */}
          <section id="alert-dialog">
            <h3 className="text-h4 mb-8">Alert Dialog</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Confirmation dialogs for destructive actions
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Registration</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your child from Soccer Skills Camp. Your spot will be released and you&apos;ll receive a full refund within 5-7 business days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                  <AlertDialogAction>Yes, Cancel</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>

          <Separator />

          {/* Sheet */}
          <section id="sheet">
            <h3 className="text-h4 mb-8">Sheet</h3>

            <p className="text-caption text-muted-foreground mb-6">
              Slide-out panels
            </p>

            <div className="flex flex-wrap gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary">Open Right</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Camp Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down camps by age, location, and type.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Age Group</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5-7">5-7 years</SelectItem>
                          <SelectItem value="8-10">8-10 years</SelectItem>
                          <SelectItem value="11-13">11-13 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SheetFooter>
                    <Button variant="secondary">Reset</Button>
                    <Button>Apply Filters</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="tertiary">Open Left</Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>
                      Browse our camp offerings.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </section>

          <Separator />

          {/* Dropdown Menu */}
          <section id="dropdown-menu">
            <h3 className="text-h4 mb-8">Dropdown Menu</h3>

            <div className="flex flex-wrap gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    Open Menu <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          <Separator />

          {/* Tooltip */}
          <section id="tooltip">
            <h3 className="text-h4 mb-8">Tooltip</h3>

            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  This is a tooltip
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <InfoIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  More information here
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          <Separator />

          {/* Popover */}
          <section id="popover">
            <h3 className="text-h4 mb-8">Popover</h3>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Camp Details</h4>
                  <p className="text-sm text-muted-foreground/80">
                    Soccer Skills Camp runs Monday through Friday, 9am-4pm. Lunch is provided.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </section>

          <Separator />

          {/* Footer */}
          <footer className="pt-16 pb-8 text-center">
            <p className="text-caption text-muted-foreground">
              Tenpo Design System • Built with shadcn/ui + Tailwind CSS 4
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
