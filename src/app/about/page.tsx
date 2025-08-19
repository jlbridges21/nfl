import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <Container className="py-8">
      <Card className="rounded-2xl border-border shadow-md dark:shadow-none max-w-4xl mx-auto">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-3xl font-bold">About NFL Predictor</CardTitle>
          <CardDescription className="text-lg mt-4">
            This app uses NFL statistics to generate game predictions and track accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed">
              The app collects NFL data, applies statistical models, and compares recent performance, home field, and other variables to predict outcomes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Key Features</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Predicted scores for upcoming games</li>
              <li>Win probability for each team</li>
              <li>Projected point spread and totals</li>
              <li>Breakdown of key factors influencing predictions</li>
              <li>Tracking of historical prediction accuracy</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Data Sources</h2>
            <p className="text-muted-foreground leading-relaxed">
              Predictions are based on official NFL statistics, efficiency metrics, injury reports, weather conditions, and market data.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This tool is for analysis and educational purposes only. Predictions are not financial advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
