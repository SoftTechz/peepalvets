// -----------------------------
// Read appointment_id from URL
// -----------------------------
const params = new URLSearchParams(window.location.search);
const appointmentId = params.get("appointment_id");
const shouldPrint =
  params.get("print") === "1" || params.get("print") === "true";

// -----------------------------
// Config
// -----------------------------
const API_BASE_URL = "/api/v1";

// Function to format medicines
function formatMedicines(medicines) {
  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return "-";
  }
  return medicines
    .map((med) => {
      const name = med.name || med.medicineName || "Unknown";
      const dosage = med.dosage || "";
      const duration = med.duration || "";
      const instructions = med.instructions || "";
      return `${name} ${dosage} ${duration} ${instructions}`.trim();
    })
    .join("\n");
}

function renderAppointment(appointment) {
  // Calculate age
  const ageYears = appointment.petAgeYears || appointment.petAgeYears || 0;
  const ageMonths = appointment.petAgeMonths || appointment.petAgeMonths || 0;
  const age = ageYears > 0 ? `${ageYears}y` : "";
  const ageStr = ageMonths > 0 ? `${age} ${ageMonths}m` : age || "-";

  // Set text for each field
  setText("owner_name", appointment.customerName || appointment.name || "-");
  setText("phone", appointment.phone || appointment.phone || "-");
  setText("pet_name", appointment.petName || appointment.petName || "-");
  setText("address", appointment.address || "-");
  setText("species", appointment.petType || appointment.petType || "-");
  setText("sex", appointment.petSex || appointment.petSex || "-");
  setText("age", ageStr);
  setText("breed", appointment.petBreed || appointment.petBreed || "-");
  setText("cmm", appointment.cmm || "-");
  setText("heart_rate", appointment.heartRate || "-");
  setText("breathing_rate", appointment.breathingRate || "-");
  setText("pulse_rate", appointment.pulseRate || "-");
  setText("weight", appointment.weight || "-");
  setText("temperature", appointment.temperature || "-");
  setText("chief_complaint", appointment.chiefComplaint || "-");
  setText("examination", appointment.historyExamination || "-");
  setText("tentative_diagnosis", appointment.tentativeDiagnosis || "-");
  setText("final_diagnosis", appointment.finalDiagnosis || "-");
  setText("treatment", appointment.treatment || "-");
  setText("advice", appointment.advice || "-");
  setText("prescription", formatMedicines(appointment.medicines));
  setText("doctor_signature", "Dr. Vaibhav Devidas Wagh");
  setText(
    "signature_date",
    appointment.date
      ? new Date(appointment.date).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN"),
  );

  if (shouldPrint) {
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (printErr) {
        console.error("Print error:", printErr);
      }
    }, 300);

    window.onafterprint = () => {
      window.close();
    };
  }
}

if (!appointmentId) {
  alert("Appointment ID is missing");
  throw new Error("Appointment ID missing");
}

(async () => {
  try {
    // Fetch appointment
    const appointmentResponse = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      { credentials: "include" },
    );
    if (!appointmentResponse.ok) {
      throw new Error(`HTTP error! status: ${appointmentResponse.status}`);
    }
    const appointmentData = await appointmentResponse.json();
    const appointment = appointmentData.appointment;

    // Fetch customer
    // let customer = {};
    // if (appointment.customerId) {
    //   try {
    //     const customerResponse = await fetch(
    //       `${API_BASE_URL}/customers/${appointment.customerId}`,
    //       { credentials: "include" },
    //     );
    //     if (customerResponse.ok) {
    //       const customerData = await customerResponse.json();
    //       customer = customerData.customer || {};
    //     }
    //   } catch (error) {
    //     console.warn("Error fetching customer data:", error);
    //   }
    // }

    renderAppointment(appointment, customer);
  } catch (error) {
    console.error("Error loading appointment data:", error);
    // alert("Failed to load appointment details");
  }
})();

// -----------------------------
// Helper function
// -----------------------------
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}
