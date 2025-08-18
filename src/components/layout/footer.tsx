export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} NFL Game Predictor. Built for entertainment and education.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          For entertainment/education; not financial advice.
        </p>
      </div>
    </footer>
  )
}
