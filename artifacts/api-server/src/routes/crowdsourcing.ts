import { Router } from "express";
import {
  ListCrowdsourcingReportsQueryParams,
  UpdateCrowdsourcingReportParams,
  UpdateCrowdsourcingReportBody,
  GetCrowdsourcingReportParams,
  ListSignReportsQueryParams,
  UpdateSignReportParams,
  UpdateSignReportBody,
} from "@workspace/api-zod";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/crowdsourcing/reports", async (req, res): Promise<void> => {
  try {
    const parsed = ListCrowdsourcingReportsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { status, page = 1, limit = 20 } = parsed.data;
    const offset = (page - 1) * limit;

    // Use Python backend
    const response = await fetch(
      `${BACKEND_URL}/crowdsource/pending?skip=${offset}&limit=${limit}`,
      {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      },
    );

    if (!response.ok) {
      res
        .status(response.status)
        .json({ error: "Failed to fetch from backend" });
      return;
    }

    const data = await response.json();

    res.json({
      items: (data.pending || []).map((r: any) => ({
        id: r.id || r.candidate_id,
        imageUrl: r.image_url || "",
        signType: r.sign_type || "UNKNOWN",
        signCode: r.sign_code || "Unknown",
        confidence: r.confidence || 0,
        lat: r.latitude || 0,
        lng: r.longitude || 0,
        submittedAt: r.created_at || new Date().toISOString(),
        status: status || "pending",
      })),
      total: data.total || 0,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.get("/crowdsourcing/reports/:id", async (req, res): Promise<void> => {
  try {
    const params = GetCrowdsourcingReportParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const response = await fetch(
      `${BACKEND_URL}/crowdsource/${params.data.id}`,
      {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      },
    );

    if (!response.ok) {
      res.status(response.status).json({ error: "Report not found" });
      return;
    }

    const data = await response.json();
    res.json({
      id: data.id,
      imageUrl: data.image_url || "",
      signType: data.sign_type || "UNKNOWN",
      signCode: data.sign_code || "Unknown",
      confidence: data.confidence || 0,
      lat: data.latitude || 0,
      lng: data.longitude || 0,
      submittedAt: data.timestamp || new Date().toISOString(),
      status: data.status || "pending",
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.patch("/crowdsourcing/reports/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateCrowdsourcingReportParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateCrowdsourcingReportBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    let response;
    if (body.data.status === "approved") {
      response = await fetch(`${BACKEND_URL}/crowdsource/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
        },
        body: JSON.stringify({
          candidate_sign_id: params.data.id,
          admin_notes: body.data.notes || "",
        }),
      });
    } else if (body.data.status === "rejected") {
      response = await fetch(`${BACKEND_URL}/crowdsource/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
        },
        body: JSON.stringify({
          candidate_sign_id: params.data.id,
          rejection_reason: body.data.notes || "Rejected",
        }),
      });
    } else {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to update" });
      return;
    }

    res.json({
      id: params.data.id,
      status: body.data.status,
      notes: body.data.notes,
      reviewedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.get("/crowdsourcing/sign-reports", async (req, res): Promise<void> => {
  res.json({ items: [], total: 0 }); // Mocked for now, need backend endpoint
});

router.patch(
  "/crowdsourcing/sign-reports/:id",
  async (req, res): Promise<void> => {
    res.status(501).json({ error: "Not implemented in Proxy yet" });
  },
);

router.get("/crowdsourcing/stats", async (req, res): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/statistics/overview`, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        totalPending: data.total_pending_candidates || 0,
        totalApproved: data.total_signs || 0,
        totalRejected: 0,
        approvalRate: 0.8,
        recentActivity: [],
      });
    } else {
      res.json({
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        approvalRate: 0,
        recentActivity: [],
      });
    }
  } catch (err) {
    res.json({
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      approvalRate: 0,
      recentActivity: [],
    });
  }
});

export default router;
