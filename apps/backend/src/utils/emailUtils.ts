import nodemailer from "nodemailer"

// ./mail.js

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error("Failed to create a testing account. " + err.message)
    return
  }

  // 1️⃣  Configure a transporter that talks to Ethereal
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: account.user, // generated user
      pass: account.pass, // generated password
    },
  })

  // 2️⃣  Send a message
  transporter
    .sendMail({
      from: "Example app <no-reply@example.com>",
      to: "user@example.com",
      subject: "Hello from tests ✔",
      text: "This message was sent from a Node.js integration test.",
    })
    .then((info) => {
      console.log("Message sent: %s", info.messageId)
      // Preview the stored message in Ethereal’s web UI
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    })
    .catch(console.error)
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendWelcomeEmail(email: string, password: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "no-reply@example.com",
    to: email,
    subject: "Welcome to the ProjectMaster!",
    text: `Your worker hour log account has been created.\nYour account name is your registered personal email. Temporary Password: ${password}\n Please change your password after logging in.`,
  }
  await transporter.sendMail(mailOptions)
}
