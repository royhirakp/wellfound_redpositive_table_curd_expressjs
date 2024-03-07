const express = require("express");
const router = express.Router();

const ItemService = require("../service/ItemService");

router.get("/item", async (req, res) => {
  await ItemService.getAllItems(req, res);
});
router.post("/item", async (req, res) => {
  await ItemService.createNewItem(req, res);
});
router.delete("/item/:id", async (req, res) => {
  await ItemService.deleteItemById(req, res);
});
router.put("/item/:id", async (req, res) => {
  await ItemService.updateById(req, res);
});
router.post("/send_Email", async (req, res) => {
  await ItemService.sendMail(req, res);
});

module.exports = router;
