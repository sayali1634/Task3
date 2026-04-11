// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DB CONNECTION (FIXED PORT 3306)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",   // put your MySQL password if any
  database: "groupdb",
  port: 3307      // 🔥 IMPORTANT FIX
});

db.connect(err => {
  if(err){
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ DB Connected");
  }
});


// ================= GROUP =================

// Add group
app.post("/groups",(req,res)=>{
  const { group_name } = req.body;

  if(!group_name){
    return res.status(400).json({ message:"Group required" });
  }

  db.query(
    "INSERT INTO groups(group_name,is_active) VALUES(?,true)",
    [group_name],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Group added" });
    }
  );
});

// Get groups
app.get("/groups",(req,res)=>{
  db.query(
    "SELECT * FROM groups WHERE is_active=true",
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json(r);
    }
  );
});


// ================= CHAINS =================

app.post("/chains",(req,res)=>{
  const { company_name, gstn_no, group_id } = req.body;

  if(!company_name || !gstn_no || !group_id){
    return res.status(400).json({ message:"All fields required" });
  }

  db.query(
    "INSERT INTO chains(company_name,gstn_no,group_id,is_active,created_at,updated_at) VALUES(?,?,?,?,NOW(),NOW())",
    [company_name,gstn_no,group_id,true],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Chain added" });
    }
  );
});

app.get("/chains",(req,res)=>{
  db.query(
    `SELECT c.*, g.group_name 
     FROM chains c 
     JOIN groups g ON c.group_id=g.group_id
     WHERE c.is_active=true`,
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json(r);
    }
  );
});

app.put("/chains/:id",(req,res)=>{
  const { company_name, gstn_no, group_id } = req.body;

  db.query(
    "UPDATE chains SET company_name=?, gstn_no=?, group_id=?, updated_at=NOW() WHERE chain_id=?",
    [company_name,gstn_no,group_id,req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Chain updated" });
    }
  );
});

app.patch("/chains/:id/delete",(req,res)=>{
  db.query(
    "UPDATE chains SET is_active=false WHERE chain_id=?",
    [req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Chain deleted" });
    }
  );
});


// ================= BRANDS =================

app.post("/brands",(req,res)=>{
  const { brand_name, chain_id } = req.body;

  if(!brand_name || !chain_id){
    return res.status(400).json({ message:"Brand & chain required" });
  }

  db.query(
    "INSERT INTO brands(brand_name,chain_id,is_active) VALUES(?,?,true)",
    [brand_name,chain_id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Brand added" });
    }
  );
});

app.get("/brands",(req,res)=>{
  db.query(
    `SELECT b.*, c.company_name, g.group_name
     FROM brands b
     JOIN chains c ON b.chain_id=c.chain_id
     JOIN groups g ON c.group_id=g.group_id
     WHERE b.is_active=true`,
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json(r);
    }
  );
});

app.put("/brands/:id",(req,res)=>{
  const { brand_name, chain_id } = req.body;

  db.query(
    "UPDATE brands SET brand_name=?, chain_id=? WHERE brand_id=?",
    [brand_name,chain_id,req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Brand updated" });
    }
  );
});

app.patch("/brands/:id/delete",(req,res)=>{
  db.query(
    "UPDATE brands SET is_active=false WHERE brand_id=?",
    [req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Brand deleted" });
    }
  );
});


// ================= SUBZONES =================

app.post("/subzones",(req,res)=>{
  const { subzone_name, brand_id } = req.body;

  if(!subzone_name || !brand_id){
    return res.status(400).json({ message:"Subzone & brand required" });
  }

  db.query(
    "INSERT INTO zones(subzone_name,brand_id,is_active,created_at,updated_at) VALUES(?,?,true,NOW(),NOW())",
    [subzone_name,brand_id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Subzone added" });
    }
  );
});

app.get("/subzones",(req,res)=>{
  db.query(
    `SELECT s.*, b.brand_name, b.brand_id
     FROM zones s
     JOIN brands b ON s.brand_id=b.brand_id
     WHERE s.is_active=true`,
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json(r);
    }
  );
});

app.put("/subzones/:id",(req,res)=>{
  const { subzone_name, brand_id } = req.body;

  db.query(
    "UPDATE zones SET zone_name=?, brand_id=?, updated_at=NOW() WHERE zone_id=?",
    [subzone_name,brand_id,req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Subzone updated" });
    }
  );
});

app.patch("/subzones/:id/delete",(req,res)=>{
  db.query(
    "UPDATE zones SET is_active=false WHERE zone_id=?",
    [req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Subzone deleted" });
    }
  );
});


// ================= ZONES =================

app.post("/zones",(req,res)=>{
  const { zone_name, brand_id } = req.body;

  if(!zone_name || !brand_id){
    return res.status(400).json({ message:"Zone & brand required" });
  }

  db.query(
    "INSERT INTO zones(zone_name,brand_id,is_active,created_at,updated_at) VALUES(?,?,true,NOW(),NOW())",
    [zone_name,brand_id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Zone added" });
    }
  );
});

app.get("/zones",(req,res)=>{
  db.query(
    `SELECT z.*, b.brand_name, b.brand_id
     FROM zones z
     JOIN brands b ON z.brand_id=b.brand_id
     WHERE z.is_active=true`,
    (err,r)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json(r);
    }
  );
});

app.put("/zones/:id",(req,res)=>{
  const { zone_name, brand_id } = req.body;

  db.query(
    "UPDATE zones SET zone_name=?, brand_id=?, updated_at=NOW() WHERE zone_id=?",
    [zone_name,brand_id,req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Zone updated" });
    }
  );
});

app.patch("/zones/:id/delete",(req,res)=>{
  db.query(
    "UPDATE zones SET is_active=false WHERE zone_id=?",
    [req.params.id],
    (err)=>{
      if(err) return res.status(500).json({ message:err.message });
      res.json({ message:"Zone deleted" });
    }
  );
});


// ================= START SERVER =================
app.listen(5000,()=>{
  console.log("🚀 Server running on http://localhost:5000");
});