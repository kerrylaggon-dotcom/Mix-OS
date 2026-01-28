import request from "supertest";
import { app } from "../index";

const req = request(app) as any;

describe("Environments API", () => {
  it("should get empty environments list", async () => {
    const response = await req.get("/api/environments");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should create a new environment", async () => {
    const envData = {
      name: "Test VM",
      type: "qemu",
      cpuCores: 2,
      memoryMB: 1024,
      diskSizeGB: 10,
    };
    const response = await req.post("/api/environments").send(envData);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test VM");
    expect(response.body.type).toBe("qemu");
  });

  it("should get environment by id", async () => {
    // First create
    const createRes = await req.post("/api/environments").send({
      name: "Test VM",
      type: "qemu",
    });
    const id = createRes.body.id;

    const response = await req.get(`/api/environments/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
  });

  it("should delete environment", async () => {
    // First create
    const createRes = await req.post("/api/environments").send({
      name: "Test VM",
      type: "qemu",
    });
    const id = createRes.body.id;

    const deleteRes = await req.delete(`/api/environments/${id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await req.get(`/api/environments/${id}`);
    expect(getRes.status).toBe(404);
  });
});
