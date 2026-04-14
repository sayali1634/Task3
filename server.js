const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================= DB CONNECTION =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "groupdb",
  port: 3307   // ⚠️ change to 3307 only if your MySQL runs on 3307
});

db.connect(err => {
  if (err) {
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ================= GROUPS =================
app.post("/groups", (req, res) => {
  const { group_name } = req.body;

  db.query(
    "INSERT INTO groups(group_name,is_active) VALUES(?,1)",
    [group_name],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Group added" });
    }
  );
});

app.get("/groups", (req, res) => {
  db.query("SELECT * FROM groups WHERE is_active=1", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ================= CHAINS =================
app.post("/chains", (req, res) => {
  const { company_name, gstn_no, group_id } = req.body;

  db.query(
    "INSERT INTO chains(company_name,gstn_no,group_id,is_active) VALUES(?,?,?,1)",
    [company_name, gstn_no, group_id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Chain added" });
    }
  );
});

app.get("/chains", (req, res) => {
  db.query(
    `SELECT c.*, g.group_name
     FROM chains c
     JOIN groups g ON c.group_id = g.group_id
     WHERE c.is_active=1`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ================= BRANDS =================
app.post("/brands", (req, res) => {
  const { brand_name, chain_id } = req.body;

  db.query(
    "INSERT INTO brands(brand_name,chain_id,is_active) VALUES(?,?,1)",
    [brand_name, chain_id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Brand added" });
    }
  );
});

app.get("/brands", (req, res) => {
  db.query(
    `SELECT b.*, c.company_name
     FROM brands b
     JOIN chains c ON b.chain_id = c.chain_id
     WHERE b.is_active=1`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ================= ZONES =================
app.post("/zones", (req, res) => {
  const { zone_name, brand_id } = req.body;

  db.query(
    "INSERT INTO zones(zone_name,brand_id,is_active) VALUES(?,?,1)",
    [zone_name, brand_id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Zone added" });
    }
  );
});

app.get("/zones", (req, res) => {
  db.query(
    `SELECT z.*, b.brand_name
     FROM zones z
     JOIN brands b ON z.brand_id = b.brand_id
     WHERE z.is_active=1`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ================= SUBZONES =================

// ADD SUBZONE
app.post("/subzones", (req, res) => {
  const { subzone_name, brand_id } = req.body;

  db.query(
    "INSERT INTO subzones(subzone_name, brand_id, is_active) VALUES(?,?,1)",
    [subzone_name, brand_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Subzone added" });
    }
  );
});

// GET SUBZONES (JOIN BRAND NAME)
app.get("/subzones", (req, res) => {
  db.query(
    `SELECT s.*, b.brand_name 
     FROM subzones s
     JOIN brands b ON s.brand_id = b.brand_id
     WHERE s.is_active=1`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// UPDATE SUBZONE
app.put("/subzones/:id", (req, res) => {
  const { subzone_name, brand_id } = req.body;

  db.query(
    "UPDATE subzones SET subzone_name=?, brand_id=? WHERE subzone_id=?",
    [subzone_name, brand_id, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated" });
    }
  );
});

// DELETE (soft delete)
app.patch("/subzones/:id/delete", (req, res) => {
  db.query(
    "UPDATE subzones SET is_active=0 WHERE subzone_id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Deleted" });
    }
  );
});

// ================= ESTIMATES =================
app.post("/estimates", (req, res) => {
  const {
    group_name,
    chain_name,
    brand_name,
    zone_name,
    service_details,
    total_quantity,
    cost_per_quantity,
    expected_delivery_date,
    other_details
  } = req.body;

  const total_amount = Number(total_quantity) * Number(cost_per_quantity);

  db.query(
    `INSERT INTO estimates
    (group_name,chain_name,brand_name,zone_name,
     service_details,total_quantity,cost_per_quantity,total_amount,
     expected_delivery_date,other_details,is_active)
     VALUES (?,?,?,?,?,?,?,?,?,?,1)`,

    [
      group_name,
      chain_name,
      brand_name,
      zone_name,
      service_details,
      total_quantity,
      cost_per_quantity,
      total_amount,
      expected_delivery_date,
      other_details
    ],

    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Estimate saved" });
    }
  );
});

app.get("/estimates", (req, res) => {
  db.query(
    "SELECT * FROM estimates WHERE is_active=1 ORDER BY estimate_id DESC",
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ================= INVOICES =================
app.post("/invoices", (req, res) => {

  const {
    estimated_id,
    chain_id,
    service_details,
    qty,
    cost_per_qty,
    amount_payable,
    balance,
    date_of_service,
    delivery_details,
    email_id
  } = req.body;

  const invoice_no = Math.floor(1000 + Math.random() * 9000);

  const sql = `
    INSERT INTO invoices
    (invoice_no, estimated_id, chain_id, service_details, qty,
     cost_per_qty, amount_payable, balance, date_of_service,
     delivery_details, email_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    invoice_no,
    estimated_id,
    chain_id,
    service_details,
    qty,
    cost_per_qty,
    amount_payable,
    balance,
    date_of_service,
    delivery_details,
    email_id
  ], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      message: "Invoice Created Successfully",
      invoice_no,
      id: result.insertId
    });
  });
});

// ================= GET INVOICES =================
app.get("/invoices", (req, res) => {
  db.query(
    "SELECT * FROM invoices ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ================= COUNTS API =================
app.get("/counts/groups", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM groups WHERE is_active=1", (err, r) => {
    res.json(r[0]);
  });
});

app.get("/counts/chains", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM chains WHERE is_active=1", (err, r) => {
    res.json(r[0]);
  });
});

app.get("/counts/brands", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM brands WHERE is_active=1", (err, r) => {
    res.json(r[0]);
  });
});

app.get("/counts/zones", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM zones WHERE is_active=1", (err, r) => {
    res.json(r[0]);
  });
});

app.get("/counts/estimates", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM estimates WHERE is_active=1", (err, r) => {
    res.json(r[0]);
  });
});

app.get("/counts/invoices", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM invoices", (err, r) => {
    res.json(r[0]);
  });
});

// ================= START SERVER =================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});