"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[24px] data-[size=default]:w-[44px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:bg-primary data-[checked]:bg-primary data-[state=unchecked]:bg-slate-200 data-[unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-input/80 dark:data-[unchecked]:bg-input/80 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-[state=checked]:translate-x-[20px] group-data-[size=default]/switch:data-[checked]:translate-x-[20px] group-data-[size=sm]/switch:data-[state=checked]:translate-x-[10px] group-data-[size=sm]/switch:data-[checked]:translate-x-[10px] group-data-[size=default]/switch:data-[state=unchecked]:translate-x-[2px] group-data-[size=default]/switch:data-[unchecked]:translate-x-[2px] group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-0 group-data-[size=sm]/switch:data-[unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
