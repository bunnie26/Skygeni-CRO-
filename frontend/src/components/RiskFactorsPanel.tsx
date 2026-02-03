import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import type { RiskFactors } from "../api";

export function RiskFactorsPanel({ riskFactors }: { riskFactors: RiskFactors }) {
  const items: string[] = [];
  riskFactors.staleDeals.forEach((s) => {
    items.push(`• ${s.detail}`);
  });
  riskFactors.underperformingReps.forEach((r) => {
    items.push(`• Rep ${r.repName} - ${r.metric}: ${r.value}`);
  });
  riskFactors.lowActivityAccounts.forEach((a) => {
    if (a.count > 0) items.push(`• ${a.detail}`);
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Top Risk Factors
      </Typography>
      <List dense disablePadding>
        {items.length === 0 ? (
          <ListItem>
            <ListItemText primary="No major risk factors identified." />
          </ListItem>
        ) : (
          items.map((text, i) => (
            <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
              <ListItemText primary={text} primaryTypographyProps={{ variant: "body2" }} />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}
