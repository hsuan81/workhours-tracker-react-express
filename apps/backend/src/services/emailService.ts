import transporter from "../utils/emailUtils"

// Send welcome email with temporary password
export async function sendWelcomeEmail(email: string, password: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "no-reply@example.com",
    to: email,
    subject: "Welcome to the ProjectMaster!",
    text: `Your worker hour log account has been created.\nYour account name is your registered personal email. Temporary Password: ${password}\n Please change your password after logging in.`,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Welcome email sent: %s", info.messageId)
    // console.log("Preview URL: %s", transporter.getTestMessageUrl(info))
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw Error("Failed to send welcome email: " + (error as Error).message)
  }
}
