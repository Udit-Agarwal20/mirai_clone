/**
 * Live interactive Fee & Scholarship Calculator with server-side API synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  const feeForm = document.getElementById('feeCalculatorForm');
  if (!feeForm) return;

  const programSelect = document.getElementById('calcProgram');
  const campusSelect = document.getElementById('calcCampus');
  const hostelToggle = document.getElementById('calcHostelToggle');
  const scholarshipSelect = document.getElementById('calcScholarship');
  const tenureSelect = document.getElementById('calcTenure');

  // Display Elements
  const regFeeDisplay = document.getElementById('displayRegFee');
  const tuitionDisplay = document.getElementById('displayTuitionFee');
  const labFeeDisplay = document.getElementById('displayLabFee');
  const hostelDisplay = document.getElementById('displayHostelFee');
  const subtotalDisplay = document.getElementById('displaySubtotal');
  const scholarshipWaiverDisplay = document.getElementById('displayScholarshipWaiver');
  const netTotalDisplay = document.getElementById('displayNetTotal');
  const emiDisplay = document.getElementById('displayMonthlyEmi');
  const tenureDisplay = document.getElementById('displayTenureMonths');

  const updateCalculations = async () => {
    try {
      const payload = {
        programId: programSelect ? programSelect.value : '',
        campusId: campusSelect ? campusSelect.value : '',
        includeHostel: hostelToggle ? hostelToggle.checked : true,
        scholarshipId: scholarshipSelect ? scholarshipSelect.value : 'none',
        tenure: tenureSelect ? tenureSelect.value : '48',
      };

      const response = await fetch('/api/fees/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!data.success || !data.calculation) return;

      const calc = data.calculation;
      const fmt = data.formatted;

      if (regFeeDisplay) regFeeDisplay.textContent = fmt.registrationFee;
      if (tuitionDisplay) tuitionDisplay.textContent = fmt.tuitionFourYears;
      if (labFeeDisplay) labFeeDisplay.textContent = fmt.labFeesFourYears;
      if (hostelDisplay) hostelDisplay.textContent = fmt.hostelFourYears;
      if (subtotalDisplay) subtotalDisplay.textContent = fmt.grossSubtotal;
      if (scholarshipWaiverDisplay) scholarshipWaiverDisplay.textContent = `- ${fmt.scholarshipWaiver}`;
      if (netTotalDisplay) netTotalDisplay.textContent = fmt.netTotalEstimated;
      if (emiDisplay) emiDisplay.textContent = fmt.monthlyEstimate;
      if (tenureDisplay) tenureDisplay.textContent = `${calc.financing.tenureMonths} Months`;
    } catch (err) {
      console.error('[FeeCalculator] Failed to update live fees:', err);
    }
  };

  if (programSelect) programSelect.addEventListener('change', updateCalculations);
  if (campusSelect) campusSelect.addEventListener('change', updateCalculations);
  if (hostelToggle) hostelToggle.addEventListener('change', updateCalculations);
  if (scholarshipSelect) scholarshipSelect.addEventListener('change', updateCalculations);
  if (tenureSelect) tenureSelect.addEventListener('change', updateCalculations);
});
