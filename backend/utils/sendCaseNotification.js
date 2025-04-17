const nodemailer = require("nodemailer");
const pool = require("../config/db");

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 *                                                          //Paramedters for Case ID, CaseName, Update type (Tipped / Status Update), Update Detail written in email 
 * 
 * @param {Object} parameters
 * @param {number|string} Case ID
 * @param {string} CaseName
 * @param {string} Update Type (Tipped/Status Update)
 * @param {string} Update Detail in email
 */
async function sendCaseNotification({ personId, caseName, updateType, detail }) {                               //Sends email when case has been updated / tipped.
  try {
    const caseLink = `http://localhost:3000/case/${personId}`;
    const subject = `🔔 Update on Missing Person Case: ${caseName}`;
    const body = `Hello,

There has been a ${updateType === "tip" ? "new tip submitted" : "status update"} on the case: ${caseName}.

Details:
${detail}

View the case:
${caseLink}

– Missing Persons Finder`;

    
    const reporterRes = await pool.query(                                         //Retrives reported by email
      `SELECT users.email FROM persons 
       JOIN users ON persons.reported_by = users.user_id 
       WHERE persons.id = $1`,
      [personId]
    );
    const reporterEmail = reporterRes.rows[0]?.email;


    const roleRes = await pool.query(                                               //Sends email to Admin and the Police for updates
      `SELECT email FROM users WHERE role IN ('admin', 'police')`
    );
    const roleEmails = roleRes.rows.map((row) => row.email);

    
    const allRecipients = [reporterEmail, ...roleEmails].filter(Boolean);

    if (allRecipients.length === 0) {
      console.warn("No recipients found for case notification.");
      return;
    }

    
    await transporter.sendMail({                                                      //Sends email
      from: `Missing Persons DB <${process.env.EMAIL_USER}>`,
      to: allRecipients,
      subject,
      text: body,
    });

    console.log("Notification email sent to:", allRecipients);
  } catch (err) {
    console.error("Failed to send notification email:", err.message);
  }
}

module.exports = sendCaseNotification;
