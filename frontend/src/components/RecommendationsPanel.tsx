import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export function RecommendationsPanel({ recommendations }: { recommendations: string[] }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recommended Actions
      </Typography>
      <List dense disablePadding>
        {recommendations.map((text, i) => (
          <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={text} primaryTypographyProps={{ variant: "body2" }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
