import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <Container className="py-8">
      <Card className="rounded-2xl border-border shadow-md dark:shadow-none max-w-4xl mx-auto">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-3xl font-bold">About NFL Game Predictor</CardTitle>
          <CardDescription className="text-lg mt-4">
            Advanced analytics and machine learning for NFL game predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our prediction model combines multiple data sources and statistical approaches to forecast NFL game outcomes. 
              We analyze offensive and defensive efficiency metrics, recent team performance, home field advantage, 
              and historical matchup data to generate accurate predictions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Key Features</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Real-time score predictions with confidence intervals</li>
              <li>Win probability calculations for both teams</li>
              <li>Point spread and total (over/under) predictions</li>
              <li>Factor analysis showing what drives each prediction</li>
              <li>Historical accuracy tracking and model validation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Data Sources</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our model incorporates official NFL statistics, advanced metrics like DVOA and EPA, 
              injury reports, weather conditions, and betting market data to provide comprehensive predictions.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This application is designed for entertainment and educational purposes only. 
              Predictions should not be used as the sole basis for any financial decisions or gambling activities.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
