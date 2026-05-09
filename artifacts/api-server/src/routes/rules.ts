import { Router } from "express";
import {
  ListRulesQueryParams,
  CreateRuleBody,
  GetRuleParams,
  UpdateRuleParams,
  UpdateRuleBody,
  DeleteRuleParams,
} from "@workspace/api-zod";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/rules", async (req, res): Promise<void> => {
  try {
    const parsed = ListRulesQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    let url = `${BACKEND_URL}/rulesets/?skip=0&limit=1000&active_only=false`;
    if (parsed.data.vehicleType) {
      url += `&vehicle_type=${parsed.data.vehicleType}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      res
        .status(response.status)
        .json({ error: "Failed to fetch from backend" });
      return;
    }

    const data = await response.json();

    res.json({
      items: (data.rules || []).map((r: any) => ({
        id: r.id,
        signCode: r.sign_code || "",
        signContent: r.sign_type || r.condition_description || "Traffic Sign",
        vehicleType: r.target_vehicle_type || "",
        warningMessage: r.alert_message || "",
        isActive: r.is_active !== undefined ? r.is_active : true,
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || new Date().toISOString(),
      })),
      total: data.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.post("/rules", async (req, res): Promise<void> => {
  try {
    const body = CreateRuleBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const response = await fetch(`${BACKEND_URL}/rulesets/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: JSON.stringify({
        sign_code: body.data.signCode,
        sign_type: body.data.signContent || "general",
        target_vehicle_type: body.data.vehicleType,
        alert_message: body.data.warningMessage,
        is_active: body.data.isActive ?? true,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      res
        .status(response.status)
        .json({ error: errData.detail || "Failed to create rule" });
      return;
    }

    const r = await response.json();
    res.status(201).json({
      id: r.id,
      signCode: r.sign_code || "",
      signContent: r.sign_type || r.condition_description || "Traffic Sign",
      vehicleType: r.target_vehicle_type || "",
      warningMessage: r.alert_message || "",
      isActive: r.is_active !== undefined ? r.is_active : true,
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.get("/rules/:id", async (req, res): Promise<void> => {
  try {
    const params = GetRuleParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const response = await fetch(`${BACKEND_URL}/rulesets/${params.data.id}`, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Rule not found" });
      return;
    }

    const r = await response.json();
    res.json({
      id: r.id,
      signCode: r.sign_code || "",
      signContent: r.sign_type || r.condition_description || "Traffic Sign",
      vehicleType: r.target_vehicle_type || "",
      warningMessage: r.alert_message || "",
      isActive: r.is_active !== undefined ? r.is_active : true,
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.patch("/rules/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateRuleParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateRuleBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const updatePayload: any = {};
    if (body.data.warningMessage !== undefined)
      updatePayload.alert_message = body.data.warningMessage;
    if (body.data.isActive !== undefined)
      updatePayload.is_active = body.data.isActive;

    const response = await fetch(`${BACKEND_URL}/rulesets/${params.data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body:
        Object.keys(updatePayload).length > 0
          ? JSON.stringify(updatePayload)
          : "{}",
    });

    if (!response.ok) {
      const errData = await response.json();
      res
        .status(response.status)
        .json({ error: errData.detail || "Failed to update rule" });
      return;
    }

    const r = await response.json();
    res.json({
      id: r.id,
      signCode: r.sign_code || "",
      signContent: r.sign_type || r.condition_description || "Traffic Sign",
      vehicleType: r.target_vehicle_type || "",
      warningMessage: r.alert_message || "",
      isActive: r.is_active !== undefined ? r.is_active : true,
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.delete("/rules/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteRuleParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const response = await fetch(`${BACKEND_URL}/rulesets/${params.data.id}`, {
      method: "DELETE",
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to delete rule" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

export default router;
