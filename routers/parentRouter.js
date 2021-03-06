const multer = require("multer");
const express = require("express");
const bcrypt = require("bcrypt-nodejs");

const parentRouter = express.Router();

const ParentModel = require("../models/parentModel");

// get storage for file
const storage = multer.diskStorage({
  destination: "./uploadFile",
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// upload file
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
});

// get all parents
parentRouter.get("/", (req, res) => {
  ParentModel.find({}, (err, parents) => {
    if (err) res.status(500).send({ success: 0, err });
    else res.send({ success: 1, parents });
  });
});

// receive image
parentRouter.post("/upload", upload.single("myAvatar"), function(req, res) {
  console.log("Request file ---", req.file); // get file here
  console.log("Upload image successfully!");
});

// create new parent
parentRouter.post("/", (req, res) => {
  const {
    phoneNumber,
    password,
    firstname,
    lastname,
    avatar,
    sex,
    age,
    address,
    district,
    city,
    email,
    note,
    babyGender,
    babyAge,
    comment
  } = req.body;

  const hashAvatar = "localhost:1998/" + avatar;
  const salt = bcrypt.genSaltSync();
  const hashPassword = bcrypt.hashSync(password, salt);

  ParentModel.create(
    {
      phoneNumber,
      hashPassword,
      firstname,
      lastname,
      hashAvatar,
      sex,
      age,
      address,
      district,
      city,
      email,
      babyGender,
      babyAge,
      note,
      comment
    },

    (err, parentCreated) => {
      if (err) res.status(500).send({ success: 0, err });
      else res.status(201).send({ success: 1, parentCreated });
    }
  );
  console.log("Register successfully!");
});

// update info
parentRouter.put("/:parentId", async (req, res) => {
  const {
    firstname,
    lastname,
    password,
    sex,
    age,
    hastAvatar,
    address,
    district,
    city,
    email,
    babyGender,
    babyAge,
    note,
    comment
  } = req.body;

  const updateInfo = {
    fullname,
    password,
    sex,
    age,
    avatar,
    address,
    district,
    city,
    email,
    babyGender,
    babyAge,
    note,
    comment
  };

  try {
    let parentFound = await ParentModel.findById(req.params.parentId).exec();
    if (!parentFound)
      res.status(404).send({ success: 0, message: "Parent not exist" });
    else {
      for (let key in updateInfo) {
        // change password
        if (key == "password" && updateInfo[key]) {
          let compare = bcrypt.compareSync(
            updateInfo.password,
            parentFound.hashPassword
          );
          if (!compare) {
            parentFound.hashPassword = bcrypt.hashSync(
              updateInfo.password,
              bcrypt.genSaltSync()
            );
          }
        } else if (updateInfo[key]) {
          parentFound[key] = updateInfo[key];
        }
      }
      const parentUpdated = await parentFound.save();
      res.send({ success: 1, parentUpdated });
    }
  } catch (error) {
    res.status(500).send({ success: 0, err });
  }
});

// delete by id
parentRouter.delete("/:parentId", (req, res) => {
  ParentModel.findByIdAndRemove(req.params.parentId, (err, parentDeleted) => {
    if (err) res.status(500).send({ success: 0, err });
    else if (!parentDeleted)
      res.status(404).send({ success: 0, message: "Parent not exist !" });
    else res.send({ success: 1, message: "Delete success !" });
  });
});

//get one by id
parentRouter.get("/:parentId", (req, res) => {
  ParentModel.findById(req.params.parentId)
    .populate("comment.sister", "fullname avatarUrl")
    .exec((err, parentFound) => {
      if (err) res.status(500).send({ success: 0, err });
      else if (!parentFound)
        res.status(404).send({ success: 0, message: "Parent not found." });
      else res.send({ success: 1, parentFound });
    });
});

module.exports = parentRouter;
