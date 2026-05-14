
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#2D3436] group-[.toaster]:border-[#E2E8F0] group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-[#636E72]",
          actionButton:
            "group-[.toast]:bg-[#6C5CE7] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#F0F2F5] group-[.toast]:text-[#636E72]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
