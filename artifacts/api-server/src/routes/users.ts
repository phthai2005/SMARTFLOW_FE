import { Router } from "express";
import {
  ListUsersQueryParams,
  CreateUserBody,
  UpdateUserParams,
  UpdateUserBody,
  DeleteUserParams,
} from "@workspace/api-zod";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/users", async (req, res): Promise<void> => {
  try {
    const parsed = ListUsersQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { vehicleType, page = 1, limit = 20 } = parsed.data;
    const offset = (page - 1) * limit;

    const response = await fetch(
      `${BACKEND_URL}/users?skip=${offset}&limit=${limit}`,
      {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      },
    );

    if (!response.ok) {
      res.json({ items: [], total: 0 }); // Fallback
      return;
    }

    const data = await response.json();
    res.json({
      items: (data.items || data.users || []).map((r: any) => ({
        id: r.id,
        username: r.username || r.email || r.full_name || "",
        totalContributions: r.total_contributions || 0,
        vehicleType: r.vehicle_type || "car",
        registeredAt: r.created_at || new Date().toISOString(),
      })),
      total: data.total || 0,
      page,
      limit,
    });
  } catch (err) {
    res.json({ items: [], total: 0 });
  }
});

router.post("/users", async (req, res): Promise<void> => {
  try {
    const body = CreateUserBody.safeParse(req.body);
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
        email: body.data.username + "@example.com", // Mock email
        password: "password123",
        full_name: body.data.username,
        vehicle_type: body.data.vehicleType || "car",
      }),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to create user" });
      return;
    }

    const r = await response.json();
    res.status(201).json({
      id: r.id || 0,
      username: r.full_name || body.data.username,
      totalContributions: 0,
      vehicleType: r.vehicle_type || body.data.vehicleType,
      registeredAt: r.created_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateUserParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateUserBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const updatePayload: any = {};
    if (body.data.vehicleType)
      updatePayload.vehicle_type = body.data.vehicleType;
    if (body.data.username) updatePayload.full_name = body.data.username;

    const response = await fetch(`${BACKEND_URL}/users/${params.data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to update" });
      return;
    }

    const r = await response.json();
    res.json({
      id: r.id || params.data.id,
      username: r.full_name || body.data.username || "",
      totalContributions: r.total_contributions || 0,
      vehicleType: r.vehicle_type || body.data.vehicleType || "car",
      registeredAt: r.created_at || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteUserParams.safeParse(req.params);
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
