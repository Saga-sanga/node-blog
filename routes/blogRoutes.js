const express = require("express");
const blogController = require("../controllers/blogController");

const router = express.Router();

router.get("/", blogController.blog_index);

router.get("/create", blogController.blog_create_get);

router.post("/", blogController.blog_create_post);

router.get("/:id", blogController.blog_details);

router.delete("/:id", blogController.blog_delete);

router.get("/:id/edit", blogController.blog_edit_get);

router.put("/:id", blogController.blog_edit_put);

module.exports = router;
