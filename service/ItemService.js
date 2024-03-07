const mongoose = require("mongoose");
const ItemModel = require("../models/ItemModel");
const nodemailer = require("nodemailer");
class RouteController {
  //get
  static async getAllItems(req, res) {
    try {
      const data = await ItemModel.find();
      // if there is no data
      if (!data || data.length === 0) {
        return res.status(404).json({
          status: "success",
          message: "No items found in the database.",
          data: [],
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Items retrieved successfully.",
        data,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  }
  //POST
  static async createNewItem(req, res) {
    try {
      const body = req?.body;

      if (!body || Object.keys(body).length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Request body is empty or invalid.",
        });
      }

      const data = await ItemModel.create({ ...body });
      res.status(201).json({
        status: "success",
      });
    } catch (error) {
      console.error("Error in createNewItem route:", error);

      if (error.code === 11000) {
        const duplicateKey = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          status: "error",
          message: `Duplicate key error. The ${duplicateKey} is already taken.`,
        });
      }

      // handel error form mongoose model
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res.status(422).json({
          status: "error",
          message: "Validation failed.",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  }
  //DELETE
  static async deleteItemById(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid ID",
        });
      }
      const data = await ItemModel.deleteOne({ _id: req.params.id });
      if (data.deletedCount === 1) {
        return res.status(200).json({
          status: "success",
          message: "Item deleted successfully",
        });
      } else {
        return res.status(404).json({
          status: "failed",
          message: "Item not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  //PUT / UPDATE
  static async updateById(req, res) {
    const itemId = req?.params?.id;
    try {
      const updatedData = req?.body;
      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Request body is empty or invalid.",
        });
      }
      const updatedItem = await ItemModel.findByIdAndUpdate(
        itemId,
        updatedData,
        {
          new: true,
        }
      );

      if (!updatedItem) {
        return res.status(404).json({
          status: "failed",
          message: "Item not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: updatedItem,
      });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          status: "failed",
          message: "Invalid ObjectID",
        });
      }
      console.error("Error updating item:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  // SENDD MAIL
  static async sendMail(req, res) {
    try {
      //if env is not present
      if (!process.env.USER_EMAIL || !process.env.USER_EMAIL_KEY) {
        return res.status(500).json({
          status: "error",
          message:
            "Email configuration is missing. Please check enveriment varible.",
        });
      }

      // handel error is data is empty
      const updatedData = req?.body;
      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Request body is empty or invalid.",
        });
      }
      if (!Array.isArray(updatedData?.data)) {
        return res.status(400).json({
          status: "error",
          message: "invaid input , data not a array.",
        });
      } else if (updatedData.data.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Request body is empty or invalid. deta array is empty",
        });
      }
      let data = req?.body?.data || [];

      // send the otp to the user mail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_EMAIL_KEY,
        },
      });

      let tableHead = `  <thead>
      <tr style="border-bottom: 1px solid #ddd; background: #f2f2f2">
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd">
          Name
        </th>
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd">
          Phone number
        </th>
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd">
          Email
        </th>
        <th style="padding: 12px; text-align: left; border: 1px solid #ddd">
          Hobbies
        </th>
      </tr>
    </thead>`;

      let tableString = ``;
      data.map((item, i) => {
        tableString =
          tableString +
          `
      <tbody>
      <tr style="border-bottom: 1px solid #ddd">
        <td style="padding: 12px; text-align: left; border: 1px solid #ddd">
          ${item.name}
        </td>
        <td style="padding: 12px; text-align: left; border: 1px solid #ddd">
        ${item.phone}
        </td>
        <td style="padding: 12px; text-align: left; border: 1px solid #ddd">
        ${item.email}
        </td>
        <td style="padding: 12px; text-align: left; border: 1px solid #ddd">
        ${item.hobbies}
        </td>
      </tr>
    </tbody>
      `;
      });

      let email_InString =
        `
        <h1>Assignment for RedPositive Service OPC</h1>
        <h2>Table data exported</h2>
        <p>Assignment by: HIRAK ROY</p>
  
        <a href="https://www.linkedin.com/in/royhirakp">LinkedIN</a>
        <br />
        <a href=" https://github.com/royhirakp">gitHub</a
        ><br />
  
        <a href="mailto:hirakroy@mail.com">hirakroy@mail.com</a
        ><br />
        <a href="mailto:royhirakp@gmail.com">royhirakp@gmail.com</a
        >
        <br />
        <br />
        <br />
        <br />
        <br />
        <h1>RESULT:</h1>


          <table style="border-collapse: collapse; width: 100%">` +
        tableHead +
        tableString +
        `</table>
    `;

      await transporter.sendMail(
        {
          from: "royhiark@gmail.com", // sender address
          to: "royhirakp@gmail.com", // list of receivers
          subject: "Assignment for RedPositive Service OPC",
          text: `Assignment for RedPositive Service OPC`, // plain text body
          html: email_InString, // html body
        },
        // error insending mail
        (error, info) => {
          if (error) {
            console.log("error form hereeee====", error.code);
            //error for is the mail id is wrong
            if (error.code === "EENVELOPE") {
              return res.status(400).json({
                status: "error",
                message: "Invalid recipient email address.",
              });
            }

            //other all errors
            return res.status(500).json({
              status: "error",
              message: "Failed to send  email",
              error: error.message,
            });
          } else {
            console.log("Email sent============++++here:", info.response);
            return res.status(200).json({
              status: "success",
              message: "email sent successfully",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error in route:", error);
      res.status(400).json({
        status: "failed",
        message: error.message,
      });
    }
  }
}

module.exports = RouteController;
