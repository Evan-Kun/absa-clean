import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.SMTP_SSL_PORT,
    secure: true, // True for SSL, false for TLS
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS,
    },
});

const generateEmailTemplate = (data: any, template = null, extraProps = null) => {
    switch (template) {
        case "change_password":
            return `    
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
                <div style="max-width: 400px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin: auto;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p style="color: #555;">We received a request to reset your password. Click the button below to proceed.</p>
                    <a href=${data} style="display: inline-block; background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Change Password</a>
                    <p style="color: #777; font-size: 12px; margin-top: 10px;">If you didn't request this, you can ignore this email.</p>
                </div>
            </div>`;
            break;


        case "contact_organization":
            return `    
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #0073e6;">Contact Request</h2>
                    <p style="color:#000000, font-size: 16px; line-height: 1.6; margin-bottom: 20px;">

                        <strong>Name:</strong> <a href="${process.env.WEB_URL}profile/${extraProps?.user?.profile?.sysName}" style="color: #0073e6; text-decoration: none;">${extraProps?.user?.fullName || '-'}</a><br />
                        <strong>Job Title:</strong> ${extraProps?.user?.profile?.jobTitle || '-'}<br />
                        <strong>Organization Name:</strong> ${extraProps?.organization?.organizationName || '-'}<br />
                        <strong>Requested by:</strong> ${extraProps?.user?.requestedBy || 'Guest User'}<br /><br />
                        ${data}
                    </p>
                </div>`;
            break;

        default:
            return `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; padding: 20px;">
                <h2 style="color: #007bff;">Hello,</h2>
                <p>${data}</p>
                <hr />
                <p style="font-size: 12px; color: #777;">This is an automated message from ${process.env.SMTP_NAME}.</p>
            </div>`;
            break;
    }
};

export const sendEmail = async (props: any) => {
    const { to, subject, text, html, template = null, extraProps = {} } = props;
    try {
        const mailOptions = {
            // from: `${process.env.SMTP_NAME} <${process.env.SMTP_USERNAME}>`,
            from: process.env.SMTP_USERNAME,
            to,
            subject: subject || "Test Email",
            text,
            html: generateEmailTemplate(text, template, extraProps),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info?.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};