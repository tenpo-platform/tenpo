"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

// Custom icons matching alert style (20x20 stroke)
const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6.5 10L9 12.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 6.5V10.5M10 13.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 7V10.5M10 13.5V13M8.66 3.5L2.1 15A1.5 1.5 0 003.44 17.25H16.56A1.5 1.5 0 0017.9 15L11.34 3.5A1.5 1.5 0 008.66 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 9V14M10 6.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const LoadingIcon = () => (
  <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25"/>
    <path d="M10 2.5A7.5 7.5 0 0117.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        warning: <WarningIcon />,
        info: <InfoIcon />,
        loading: <LoadingIcon />,
      }}
      toastOptions={{
        classNames: {
          toast: "!gap-4 !p-4 !rounded-lg !shadow-lg !border-0 !bg-card !text-card-foreground",
          title: "!font-medium",
          description: "!text-sm !opacity-80",
          icon: "!m-0 !shrink-0",
          success: "!bg-success-muted !text-success-foreground [&_[data-icon]]:!text-success",
          error: "!bg-error-muted !text-error-foreground [&_[data-icon]]:!text-error",
          warning: "!bg-warning-muted !text-warning-foreground [&_[data-icon]]:!text-warning",
          info: "!bg-info-muted !text-info-foreground [&_[data-icon]]:!text-info",
          loading: "!bg-muted !text-muted-foreground [&_[data-icon]]:!text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
