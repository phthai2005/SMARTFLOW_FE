import { Router } from "express";
import {
  CreateAdminBody,
  UpdateAdminParams,
  UpdateAdminBody,
  DeleteAdminParams,
} from "@workspace/api-zod";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/admins", async (req, res): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/users?role=admin&skip=0&limit=50`, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      res.json({ items: [], total: 0 }); // Fallback
      return;
    }

    const data = await response.json();
    res.json({
      items: (data.items || data.users || []).filter((r: any) => r.role === 'superadmin' || r.role === 'localadmin').map((r: any) => ({
        id: r.id,
        username: r.username || r.email || r.full_name || "",
        role: r.role || "superadmin",
        createdAt: r.created_at || new Date().toISOString(),
      })),
      total: data.total || 0,
    });
  } catch (err) {
    res.json({ items: [], total: 0 });
  }
});

router.post("/admins", async (req, res): Promise<void> => {
  try {
    const body = CreateAdminBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.data.username + "@admin.com", // Mock email
        password: "password123",
        full_name: body.data.username,
        role: body.data.role || "localadmin",
      }),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to create admin" });
      return;
    }

    const r = await response.json();
    res.status(201).json({
      id: r.id || Date.now(),
      username: r.full_name || body.data.username,
      role: r.role || body.data.role || "superadmin",
      createdAt: r.created_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.patch("/admins/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateAdminParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateAdminBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    
    // Attempt backend update
    const updatePayload: any = {};
    if (body.data.role) updatePayload.role = body.data.role;
    
    const response = await fetch(`${BACKEND_URL}/users/${params.data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to update admin" });
      return;
    }
    
    const r = await response.json();
    res.json({
      id: r.id || params.data.id,
      username: r.full_name || r.email || r.username || `Admin_${params.data.id}`,
      role: r.role || body.data.role || "superadmin",
      createdAt: r.created_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.delete("/admins/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteAdminParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const response = await fetch(`${BACKEND_URL}/users/${params.data.id}`, {
      method: "DELETE",
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to delete" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }

router.patch("/admins/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateAdminParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateAdminBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    
    // Attempt backend update
    const updatePayload: any = {};
    if (body.data.role) updatePayload.role = body.data.role;
    
    const response = await fetch(`${BACKEND_URL}/users/${params.data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to update admin" });
      return;
    }
    
    const r = await response.json();
    res.json({
      id: r.id || params.data.id,
      username: r.full_name || r.email || r.username || `Admin_${params.data.id}`,
      role: r.role || body.data.role || "superadmin",
      createdAt: r.created_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.delete("/admins/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteAdminParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const response = await fetch(`${BACKEND_URL}/users/${params.data.id}`, {
      method: "DELETE",
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to delete" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

export default router;
