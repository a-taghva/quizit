import { Box, Card, CardContent, CardActions, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const PLANS = [
  {
    id: 'weekly',
    name: 'Weekly',
    priceText: '$3.99 CAD / week',
    stripePriceId: 'price_1TBFpbASpaiyAE8IGOjeBFi7',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    priceText: '$9.99 CAD / month',
    stripePriceId: 'price_1TBFpkASpaiyAE8I50hdXjlG',
  },
  {
    id: 'annual',
    name: 'Annually',
    priceText: '$99 CAD / year',
    stripePriceId: 'price_1TBFq3ASpaiyAE8IRUAB4hyW',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    priceText: '$120 CAD one-time',
    stripePriceId: 'price_1TBFpIASpaiyAE8I1CuV5k8i',
  },
]

export function PricingPage() {
  const navigate = useNavigate()

  const handleSubscribeClick = (planId) => {
    // Stripe checkout will be wired here later using the plan's stripePriceId.
    navigate('/pricing/success')
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 960,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 3 }}>
        QuizIt Pro
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Unlock +100 questions with any plan.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2,
          width: '100%',
        }}
      >
        {PLANS.map((plan) => (
          <Box
            key={plan.id}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' },
              maxWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' },
            }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.priceText}
                </Typography>
                <Typography variant="body2">Unlock +100 questions</Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleSubscribeClick(plan.id)}
                >
                  Subscribe
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

