import { Box, Skeleton } from "@mui/material";

export default function SkeletonLoader() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh", p: 2 }}>
      <Box sx={{ width: "min(28rem, 90vw)" }}>
        <Skeleton variant="rounded" height={160} />
        <Skeleton height={28} sx={{ mt: 2 }} />
        <Skeleton height={28} width="60%" />
      </Box>
    </Box>
  );
}
