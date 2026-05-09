import { Router } from "express";
import { ListEvidenceQueryParams } from "@workspace/api-zod";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/evidence", async (req, res): Promise<void> => {
  const parsed = ListEvidenceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 20 } = parsed.data;
  const skip = (page - 1) * limit;

  try {
    const response = await fetch(
      `${BACKEND_URL}/crowdsource/pending?skip=${skip}&limit=${limit}`,
      {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      },
    );

    if (!response.ok) throw new Error("Backend error");
    const data = await response.json();

    res.json({
      items: (data.items || []).map((e: any) => ({
        id: e.id,
        imageUrl:
          e.image_url ||
          e.image_path ||
          "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop",
        signType: e.sign_type || e.proposed_sign_type || "speed_limit",
        status: e.status || "pending",
        lat: e.latitude || e.lat || 21.0285,
        lng: e.longitude || e.lng || 105.8542,
        deviceId: "mock-device",
        confidence: e.confidence || 0.95,
        capturedAt: e.created_at || new Date().toISOString(),
      })),
      total: data.total || 0,
    });
  } catch (err) {
    res.json({ items: [], total: 0 });
  }
});

router.get("/evidence/stats", async (req, res): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/statistics/overview`, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) throw new Error("Fallback");
    const data = await response.json();

    // Attempt heat map
    const mapRes = await fetch(`${BACKEND_URL}/map/heatmap`, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });
    const mapData = mapRes.ok ? await mapRes.json() : [];

    res.json({
      totalImages: data.total_evidence || data.total_reports || 0,
      approvedCount: data.approved_evidence || data.approved_reports || 0,
      pendingCount: data.pending_evidence || data.pending_reports || 0,
      heatmapPoints: Array.isArray(mapData)
        ? mapData.map((m: any) => ({
            lat: m.latitude || m.lat || 21.0,
            lng: m.longitude || m.lng || 105.8,
            weight: m.weight || m.intensity || 1,
          }))
        : [],
    });
  } catch (err) {
    res.json({
      totalImages: 0,
      approvedCount: 0,
      pendingCount: 0,
      heatmapPoints: [],
    });
  }
});

export default router;
