// --- SNNHS SUPABASE CONNECTION INITIALIZATION ---
const SUPABASE_URL = "https://bmvwtvclqpxsbtkxptio.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdnd0dmNscXB4c2J0a3hwdGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzM1NTEsImV4cCI6MjA5NTYwOTU1MX0.NujtrUSxZwr9zqhR0RKt6WkvbOoF1yUoiSy-DmMyPts";    

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to get current date in YYYY-MM-DD format dynamically
function getSystemDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 SNNHS Enrollment & Checklist Management Portal Booted.");
   
    // --- 1. SET UP CURRENT AUTO-DATE IN ENROLLMENT FIELD ---
    const dateInput = document.getElementById("enrollDate");
    if (dateInput) {
        dateInput.value = getSystemDateString();
    }

    // --- 2. MULTI-PANEL VIEW SWITCHER ENGINE WITH PASSWORD PROTECTION ---
    const buttons = {
        dashboard: document.getElementById("btnNavDashboard"),
        enroll: document.getElementById("btnNavEnroll"),
        fillInfo: document.getElementById("btnNavFillInfo"),
        checklist: document.getElementById("btnNavChecklist"),
        search: document.getElementById("btnNavSearch"),
        list: document.getElementById("btnNavList")
    };

    const panels = {
        dashboard: document.getElementById("panelDashboard"),
        enroll: document.getElementById("panelEnroll"),
        fillInfo: document.getElementById("panelFillInfo"),
        checklist: document.getElementById("panelChecklist"),
        search: document.getElementById("panelSearch"),
        list: document.getElementById("panelList")
    };

    // 🔒 Security Configurations
    const ADMIN_PASSWORD = "adminTIN2026"; // Change this to your preferred administrative password
    let isAdminAuthenticated = false;         // Session-based authentication flag
    let pendingNavTargetKey = null;           // Tracks where the admin was trying to go during the prompt

    const authModal = document.getElementById("adminPasswordModal");
    const formAuth = document.getElementById("formAdminAuth");
    const inputPass = document.getElementById("adminInputPassword");
    const btnCancelAuth = document.getElementById("btnCancelAuth");

    // Unified switch display pipeline function
    function executePanelSwitch(key) {
        Object.values(panels).forEach(p => { if(p) p.classList.add("hidden"); });
        if(panels[key]) panels[key].classList.remove("hidden");

        Object.values(buttons).forEach(b => {
            if(b) b.className = "nav-btn w-full text-left p-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all flex items-center justify-between";
        });
        
        // Custom active class styles matching theme parameters
        if (buttons[key]) {
            buttons[key].className = "nav-btn w-full text-left p-3 rounded-lg text-sm font-bold bg-emerald-800 text-white shadow transition-all flex items-center justify-between";
        }
       
        if (dateInput) dateInput.value = getSystemDateString();
        if (key === 'dashboard') {
            loadDashboardMetrics();
        }
    }

    // Loop keys attaching intercept structures to specific administrative views
    Object.keys(buttons).forEach(key => {
        if (buttons[key]) {
            buttons[key].addEventListener("click", () => {
                // Determine if view requested requires administrative credentials
                const isProtectedView = (key === 'enroll' || key === 'checklist');

                if (isProtectedView && !isAdminAuthenticated) {
                    // Trigger modal display instead of panel switch run
                    pendingNavTargetKey = key;
                    if (authModal) authModal.classList.remove("hidden");
                    if (inputPass) inputPass.focus();
                } else {
                    // Public or already authenticated - execute normal swap route
                    executePanelSwitch(key);
                }
            });
        }
    });

    // Handle authentication form submissions
    if (formAuth) {
        formAuth.addEventListener("submit", (e) => {
            e.preventDefault();
            const enteredValue = inputPass.value;

            if (enteredValue === ADMIN_PASSWORD) {
                isAdminAuthenticated = true; 
                if (authModal) authModal.classList.add("hidden");
                formAuth.reset();
                
                // Route forward to requested admin pipeline target
                if (pendingNavTargetKey) {
                    executePanelSwitch(pendingNavTargetKey);
                    pendingNavTargetKey = null;
                }
            } else {
                alert("❌ Unauthorized! Invalid administrative authorization key supplied.");
                if (inputPass) {
                    inputPass.value = "";
                    inputPass.focus();
                }
            }
        });
    }

    // Handle cancel actions
    if (btnCancelAuth) {
        btnCancelAuth.addEventListener("click", () => {
            if (authModal) authModal.classList.add("hidden");
            formAuth.reset();
            pendingNavTargetKey = null;
        });
    }


    // --- 3. TRIPLE-TABLE ENROLLMENT ENGINE ---
    const formEnroll = document.getElementById("formEnrollStudent");
    if (formEnroll) {
        formEnroll.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("📝 Enrollment submission triggered.");

            const submitBtn = formEnroll.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "⏳ Processing Tables...";
            }

            const currentTimestamp = getSystemDateString();
            const lrnValue = document.getElementById("studentLRN").value.trim();
            const lName = document.getElementById("lastName").value.trim().toUpperCase();
            const fName = document.getElementById("firstName").value.trim().toUpperCase();
            const mName = document.getElementById("middleName").value.trim().toUpperCase();
            const extName = document.getElementById("extensionName").value.trim().toUpperCase();
            const rawGrade = document.getElementById("enrollGradeLevel").value;
            const selectedGrade = rawGrade ? parseInt(rawGrade.replace(/\D/g, ""), 10) : null;
            const currentSYValue = document.getElementById("currentSY").value;

            const genderValue = document.getElementById("enrollGender").value || null;
            const returningValue = document.getElementById("isReturningLearner").value === "YES";
            const shsValue = document.getElementById("isSHSLearner").value === "YES";
            const transfereeValue = document.getElementById("isTransferee").value === "YES";
            const addressValue = document.getElementById("currentAddress").value.trim() || null;
           
            const remarksValue = document.getElementById("checkRemarks") ? document.getElementById("checkRemarks").value.trim() : null;

            const studentProfile = {
                LRN: lrnValue,
                Lname: lName,
                Fname: fName,
                Mname: mName || null,
                Extname: extName || null,
                gender: genderValue,
                CurAdd: addressValue,
                dateFiled: currentTimestamp
            };

            const enrollmentRecord = {
                studentLRN: lrnValue,
                date: currentTimestamp,
                SY: currentSYValue,
                gradeLevel: selectedGrade,
                returningLearner: returningValue,
                SHSlearner: shsValue,            
                transferee: transfereeValue        
            };

            const checklistRecord = {
                student_lrn: lrnValue,
                school_year: currentSYValue,
                date: currentTimestamp,
                has_enrollment_form: document.getElementById("checkEnrollmentForm").checked,
                has_brigada_slip: document.getElementById("checkBrigadaSlip").checked,
                has_card: document.getElementById("checkCard").checked,
                has_psa_birth_certificate: document.getElementById("checkPSABirthCertificate").checked,
                remarks: remarksValue || null
            };

            try {
                const { error: studentErr } = await supabaseClient
                    .from('students')
                    .upsert(studentProfile, { onConflict: 'LRN' });
                if (studentErr) throw new Error(`Students Master Table: ${studentErr.message}`);

                const { error: enrollErr } = await supabaseClient
                    .from('enrolment')
                    .insert([enrollmentRecord]);
                if (enrollErr) throw new Error(`Enrolment Registry Table: ${enrollErr.message}`);

                const { error: checklistErr } = await supabaseClient
                    .from('checklists')
                    .upsert(checklistRecord, { onConflict: 'student_lrn,school_year' });
                if (checklistErr) throw new Error(`Document Checklist Table: ${checklistErr.message}`);

                alert(`🎉 Success! Enrollment transactions processed seamlessly for ${fName} ${lName}.`);
                formEnroll.reset();
               
                if (dateInput) dateInput.value = currentTimestamp;

            } catch (err) {
                console.error("Enrollment error:", err);
                alert(`❌ Process interrupted:\n${err.message}`);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "⚡ Process Enrollment";
                }
            }
        });
    }

    // --- 4. INDEPENDENT SEARCH ENGINE ---
    const btnSearchChecklist = document.getElementById("btnSearchChecklist");
    if (btnSearchChecklist) {
        btnSearchChecklist.addEventListener("click", async () => {
            const searchInput = document.getElementById("checklistSearchLRN").value.trim();
            const fallbackSY = document.getElementById("currentSY") ? document.getElementById("currentSY").value : "2026-2027";

            if (!searchInput) {
                alert("Please enter a 12-digit LRN or the student's Name to search.");
                return;
            }

            btnSearchChecklist.disabled = true;
            btnSearchChecklist.innerText = "⏳ Searching...";

            let targetLrn = searchInput;
            let studentName = "";
            let gradeLevel = "";

            try {
                let studentQuery = supabaseClient.from('students').select('LRN, Fname, Mname, Lname, Extname, gender, CurAdd');
                if (/[a-zA-Z]/.test(searchInput)) {
                    studentQuery = studentQuery.or(`Lname.ilike.%${searchInput}%,Fname.ilike.%${searchInput}%`);
                } else {
                    studentQuery = studentQuery.eq('LRN', searchInput);
                }

                const { data: studentData, error: studentError } = await studentQuery.limit(1);
                if (studentError) throw new Error(`Profile match error: ${studentError.message}`);
               
                if (!studentData || studentData.length === 0) {
                    alert(`❌ No student matching "${searchInput}" was found in the database.`);
                    return;
                }

                const sProfile = studentData[0];
                targetLrn = sProfile.LRN;
                studentName = `${sProfile.Fname} ${sProfile.Mname ? sProfile.Mname + ' ' : ''}${sProfile.Lname}${sProfile.Extname ? ' ' + sProfile.Extname : ''}`;

                document.getElementById("editGender").value = sProfile.gender || "";
                document.getElementById("editCurAdd").value = sProfile.CurAdd || "";

                const { data: enrollData, error: enrollError } = await supabaseClient
                    .from('enrolment')
                    .select('id, gradeLevel, returningLearner, SHSlearner, transferee')
                    .eq('studentLRN', targetLrn)
                    .order('date', { ascending: false })
                    .limit(1);

                if (enrollError) throw new Error(`Enrollment lookup failure: ${enrollError.message}`);
               
                let activeEnrollmentId = null;
                if (enrollData && enrollData.length > 0) {
                    const eRecord = enrollData[0];
                    activeEnrollmentId = eRecord.id;
                    gradeLevel = `Grade ${eRecord.gradeLevel}`;
                   
                    document.getElementById("editIsReturning").value = eRecord.returningLearner === true ? "YES" : "NO";
                    document.getElementById("editIsSHS").value = eRecord.SHSlearner === true ? "YES" : "NO";
                    document.getElementById("editIsTransferee").value = eRecord.transferee === true ? "YES" : "NO";
                } else {
                    gradeLevel = "Not Assigned";
                    document.getElementById("editIsReturning").value = "NO";
                    document.getElementById("editIsSHS").value = "NO";
                    document.getElementById("editIsTransferee").value = "NO";
                }

                document.getElementById("checklistTargetLRN").setAttribute("data-enroll-id", activeEnrollmentId || "");

                let { data: checklistData, error: checklistError } = await supabaseClient
                    .from('checklists')
                    .select('*')
                    .eq('student_lrn', targetLrn)
                    .order('date', { ascending: false })
                    .limit(1);

                if (checklistError) throw new Error(`Checklist lookup failure: ${checklistError.message}`);
               
                let record;
                if (!checklistData || checklistData.length === 0) {
                    record = {
                        student_lrn: targetLrn,
                        school_year: fallbackSY,
                        has_enrollment_form: false,
                        has_brigada_slip: false,
                        has_card: false,
                        has_psa_birth_certificate: false,
                        remarks: ""
                    };
                } else {
                    record = checklistData[0];
                }
               
                document.getElementById("updateCheckEnrollmentForm").checked = record.has_enrollment_form;
                document.getElementById("updateCheckBrigadaSlip").checked = record.has_brigada_slip;
                document.getElementById("updateCheckCard").checked = record.has_card;
                document.getElementById("updateCheckPSABirthCertificate").checked = record.has_psa_birth_certificate;
               
                if(document.getElementById("updateCheckRemarks")) {
                    document.getElementById("updateCheckRemarks").value = record.remarks || "";
                }
               
                document.getElementById("checklistTargetLRN").innerText = targetLrn;
                document.getElementById("checklistTargetName").innerText = studentName;
                document.getElementById("checklistTargetGrade").innerText = gradeLevel;
               
                document.getElementById("checklistStatusArea").classList.remove("hidden");
                alert(`🔍 Success! Displaying record parameters for: ${studentName}`);

            } catch (err) {
                console.error("Search Breakdown Error Log:", err);
                alert(`❌ Search System Error:\n${err.message}`);
            } finally {
                btnSearchChecklist.disabled = false;
                btnSearchChecklist.innerText = "Fetch Records";
            }
        });
    }

    // --- 5. COMPREHENSIVE RE-WRITE/UPDATE DATA SUBMISSION ENGINE ---
    const btnUpdateChecklist = document.getElementById("btnUpdateChecklist");
    if (btnUpdateChecklist) {
        btnUpdateChecklist.addEventListener("click", async () => {
            const targetLrn = document.getElementById("checklistTargetLRN").innerText.trim();
            const currentSYValue = document.getElementById("currentSY") ? document.getElementById("currentSY").value : "2026-2027";
            const cachedEnrollId = document.getElementById("checklistTargetLRN").getAttribute("data-enroll-id");

            if (!targetLrn || targetLrn === "" || targetLrn === "---") {
                alert("❌ No active student record selected. Please search first.");
                return;
            }

            btnUpdateChecklist.disabled = true;
            btnUpdateChecklist.innerText = "⏳ Saving Updates...";

            const updatedGender = document.getElementById("editGender").value || null;
            const updatedCurAdd = document.getElementById("editCurAdd").value.trim() || null;
            const updatedReturning = document.getElementById("editIsReturning").value === "YES";
            const updatedSHS = document.getElementById("editIsSHS").value === "YES";
            const updatedTransferee = document.getElementById("editIsTransferee").value === "YES";
           
            const updatedRemarks = document.getElementById("updateCheckRemarks") ? document.getElementById("updateCheckRemarks").value.trim() : null;

            try {
                const { error: studentUpdateErr } = await supabaseClient
                    .from('students')
                    .update({
                        gender: updatedGender,
                        CurAdd: updatedCurAdd
                    })
                    .eq('LRN', targetLrn);

                if (studentUpdateErr) throw new Error(`Students profile update failed: ${studentUpdateErr.message}`);

                if (cachedEnrollId) {
                    const { error: enrollUpdateErr } = await supabaseClient
                        .from('enrolment')
                        .update({
                            returningLearner: updatedReturning,
                            SHSlearner: updatedSHS,
                            transferee: updatedTransferee
                        })
                        .eq('id', parseInt(cachedEnrollId, 10));

                    if (enrollUpdateErr) throw new Error(`Enrolment fields update failed: ${enrollUpdateErr.message}`);
                }

                const { error: checklistErr } = await supabaseClient
                    .from('checklists')
                    .upsert({
                        student_lrn: targetLrn,
                        school_year: currentSYValue,
                        date: getSystemDateString(),
                        has_enrollment_form: document.getElementById("updateCheckEnrollmentForm").checked,
                        has_brigada_slip: document.getElementById("updateCheckBrigadaSlip").checked,
                        has_card: document.getElementById("updateCheckCard").checked,
                        has_psa_birth_certificate: document.getElementById("updateCheckPSABirthCertificate").checked,
                        remarks: updatedRemarks || null
                    }, { onConflict: 'student_lrn,school_year' });

                if (checklistErr) throw checklistErr;

                const studentName = document.getElementById("checklistTargetName").innerText;
                alert(`🎉 Success! Core profile, enrolment conditions, and checklist matrix successfully updated for:\n${studentName}`);
               
            } catch (err) {
                console.error("Master update operation database write failure:", err);
                alert(`❌ Failed to apply adjustments:\n${err.message}`);
            } finally {
                btnUpdateChecklist.disabled = false;
                btnUpdateChecklist.innerText = "💾 Save Student Details & Checklist Updates";
               
                if (dateInput) dateInput.value = getSystemDateString();
            }
        });
    }

    // --- 6. MASTER ENROLLED REGISTRY MATRIX LOAD & EXPORT ---
    const btnFetchRegistryList = document.getElementById("btnFetchRegistryList");
    const filterGradeLevel = document.getElementById("filterGradeLevel");
    const registryTableBody = document.getElementById("registryTableBody");
    const btnExportExcel = document.getElementById("btnExportExcel");

    if (btnFetchRegistryList) {
        btnFetchRegistryList.addEventListener("click", async () => {
            const selectedGradeInt = parseInt(filterGradeLevel.value, 10);
            const currentSYValue = document.getElementById("currentSY") ? document.getElementById("currentSY").value : "2026-2027";

            btnFetchRegistryList.disabled = true;
            btnFetchRegistryList.innerText = "⏳ Loading Registry...";
            registryTableBody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-gray-400 italic">Connecting to SNNHS Core Database...</td></tr>`;
            if (btnExportExcel) btnExportExcel.classList.add("hidden");

            try {
                const { data: enrollmentRows, error: enrollErr } = await supabaseClient
                    .from('enrolment')
                    .select('studentLRN')
                    .eq('gradeLevel', selectedGradeInt)
                    .eq('SY', currentSYValue);

                if (enrollErr) throw enrollErr;

                if (!enrollmentRows || enrollmentRows.length === 0) {
                    registryTableBody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-amber-600 font-medium">⚠️ No students registered under Grade ${selectedGradeInt} for SY ${currentSYValue}.</td></tr>`;
                    return;
                }

                const lrnList = enrollmentRows.map(row => row.studentLRN);

                const { data: studentRows, error: studentErr } = await supabaseClient
                    .from('students')
                    .select('LRN, Lname, Fname, Mname, Extname, CurAdd')
                    .in('LRN', lrnList);

                if (studentErr) throw studentErr;

                const { data: checklistRows, error: checkErr } = await supabaseClient
                    .from('checklists')
                    .select('student_lrn, has_enrollment_form, has_brigada_slip, has_card, has_psa_birth_certificate')
                    .in('student_lrn', lrnList)
                    .eq('school_year', currentSYValue);

                if (checkErr) throw checkErr;

                const studentMap = {};
                studentRows.forEach(s => { studentMap[s.LRN] = s; });

                const checklistMap = {};
                checklistRows.forEach(c => { checklistMap[c.student_lrn] = c; });

                const compiledRegistry = lrnList.map(lrn => {
                    const profile = studentMap[lrn] || { Lname: 'UNKNOWN', Fname: 'RECORD', Mname: '', Extname: '', CurAdd: 'N/A' };
                    const checklist = checklistMap[lrn] || { has_enrollment_form: false, has_brigada_slip: false, has_card: false, has_psa_birth_certificate: false };
                   
                    const compiledName = `${profile.Lname}, ${profile.Fname} ${profile.Mname || ''} ${profile.Extname || ''}`.trim().toUpperCase();

                    return {
                        lrn: lrn,
                        fullName: compiledName,
                        lastName: profile.Lname,
                        currentAddress: profile.CurAdd || "N/A",
                        form: checklist.has_enrollment_form,
                        brigada: checklist.has_brigada_slip,
                        card: checklist.has_card,
                        psa: checklist.has_psa_birth_certificate
                    };
                }).sort((a, b) => a.lastName.localeCompare(b.lastName));

                registryTableBody.innerHTML = "";
               
                compiledRegistry.forEach((student, index) => {
                    const statusBadge = (isChecked) => isChecked
                        ? `<span class="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs border border-emerald-200">✔️ Received</span>`
                        : `<span class="text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full text-xs border border-rose-100">❌ Missing</span>`;

                    const row = document.createElement("tr");
                    row.className = "hover:bg-stone-50 transition-colors divide-x divide-gray-50";
                   
                    row.innerHTML = `
                        <td class="p-3 text-center font-mono text-xs text-gray-400 bg-gray-50/50">${index + 1}</td>
                        <td class="p-3 font-mono font-bold text-emerald-800 tracking-tight">${student.lrn}</td>
                        <td class="p-3 font-semibold text-gray-800 uppercase tracking-wide">${student.fullName}</td>
                        <td class="p-3 text-sm text-gray-600 uppercase tracking-wide">${student.currentAddress}</td>
                        <td class="p-3 text-center">${statusBadge(student.form)}</td>
                        <td class="p-3 text-center">${statusBadge(student.brigada)}</td>
                        <td class="p-3 text-center">${statusBadge(student.card)}</td>
                        <td class="p-3 text-center">${statusBadge(student.psa)}</td>
                    `;
                    registryTableBody.appendChild(row);
                });

                if (btnExportExcel) btnExportExcel.classList.remove("hidden");

            } catch (err) {
                console.error("Registry load failure:", err);
                registryTableBody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-rose-500 font-bold">❌ Error Loading Registry Matrix:<br>${err.message}</td></tr>`;
            } finally {
                btnFetchRegistryList.disabled = false;
                btnFetchRegistryList.innerText = "🔄 Load Registry";
            }
        });
    }

    if (btnExportExcel) {
        btnExportExcel.addEventListener("click", () => {
            const selectedGrade = filterGradeLevel.value;
            const currentSYValue = document.getElementById("currentSY") ? document.getElementById("currentSY").value : "2026-2027";
            const filename = `SNNHS_Grade_${selectedGrade}_Checklist_Report_SY_${currentSYValue}.csv`;

            const csvRows = [];
            csvRows.push(["#", "STUDENT LRN", "\"FULL STUDENT NAME (LAST, FIRST, MIDDLE)\"", "CURRENT ADDRESS", "ENROLLMENT FORM", "BRIGADA SLIP", "REPORT CARD", "PSA BIRTH CERT"].join(","));

            const rows = registryTableBody.querySelectorAll("tr");
            rows.forEach((row, index) => {
                const cols = row.querySelectorAll("td");
                if (cols.length >= 8) {
                    const lrn = cols[1].innerText.trim();
                    const name = cols[2].innerText.trim();
                    const address = cols[3].innerText.trim();
                   
                    const formStatus = cols[4].innerText.includes("Received") ? "RECEIVED" : "MISSING";
                    const brigadaStatus = cols[5].innerText.includes("Received") ? "RECEIVED" : "MISSING";
                    const cardStatus = cols[6].innerText.includes("Received") ? "RECEIVED" : "MISSING";
                    const psaStatus = cols[7].innerText.includes("Received") ? "RECEIVED" : "MISSING";

                    const formattedLrn = `="${lrn}"`;

                    csvRows.push([
                        index + 1,
                        formattedLrn,
                        `"${name}"`,
                        `"${address}"`,
                        formStatus,
                        brigadaStatus,
                        cardStatus,
                        psaStatus
                    ].join(","));
                }
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
           
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob, filename);
            } else {
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            console.log("📥 Clear column CSV layout generated successfully with Address mapping.");
        });
    }

    // --- 7. STANDALONE DASHBOARD ENGINE ---
    async function loadDashboardMetrics() {
        const metricsBody = document.getElementById("dashboardMetricsBody");
        const totalCountEl = document.getElementById("dashStatTotal");
        const maleCountEl = document.getElementById("dashStatMale");
        const femaleCountEl = document.getElementById("dashStatFemale");
        const currentSYValue = document.getElementById("currentSY") ? document.getElementById("currentSY").value : "2026-2027";

        if (!metricsBody) return;
        metricsBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-400 italic">Compiling cross-table statistical totals...</td></tr>`;

        try {
            const { data: enrollments, error: enrollErr } = await supabaseClient
                .from('enrolment')
                .select('studentLRN, gradeLevel')
                .eq('SY', currentSYValue);

            if (enrollErr) throw enrollErr;

            if (!enrollments || enrollments.length === 0) {
                totalCountEl.innerText = "0";
                maleCountEl.innerText = "0";
                femaleCountEl.innerText = "0";
                metricsBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-amber-600 font-medium">No records found for SY ${currentSYValue}.</td></tr>`;
                return;
            }

            const uniqueLrns = [...new Set(enrollments.map(e => e.studentLRN))];
            const { data: studentProfiles, error: studentErr } = await supabaseClient
                .from('students')
                .select('LRN, gender')
                .in('LRN', uniqueLrns);

            if (studentErr) throw studentErr;

            const genderMap = {};
            studentProfiles.forEach(s => {
                genderMap[s.LRN] = s.gender ? s.gender.toUpperCase() : "UNASSIGNED";
            });

            const targetGrades = [7, 8, 9, 10, 11, 12];
            const metrics = {};
            targetGrades.forEach(g => {
                metrics[g] = { male: 0, female: 0, total: 0 };
            });

            let runningTotalOverall = 0;
            let runningTotalMale = 0;
            let runningTotalFemale = 0;

            enrollments.forEach(e => {
                const gLevel = e.gradeLevel;
                if (metrics[gLevel]) {
                    const gender = genderMap[e.studentLRN] || "UNASSIGNED";
                    
                    if (gender === "MALE") {
                        metrics[gLevel].male++;
                        runningTotalMale++;
                    } else if (gender === "FEMALE") {
                        metrics[gLevel].female++;
                        runningTotalFemale++;
                    }
                    metrics[gLevel].total++;
                    runningTotalOverall++;
                }
            });

            totalCountEl.innerText = runningTotalOverall;
            maleCountEl.innerText = runningTotalMale;
            femaleCountEl.innerText = runningTotalFemale;

            metricsBody.innerHTML = "";
            targetGrades.forEach(g => {
                const tr = document.createElement("tr");
                tr.className = "hover:bg-stone-50 transition-colors text-center";
                tr.innerHTML = `
                    <td class="p-4 text-left font-bold text-stone-800">Grade ${g}</td>
                    <td class="p-4 text-emerald-700 font-semibold">${metrics[g].male}</td>
                    <td class="p-4 text-rose-700 font-semibold">${metrics[g].female}</td>
                    <td class="p-4 font-black bg-stone-100/40 text-stone-900">${metrics[g].total}</td>
                `;
                metricsBody.appendChild(tr);
            });

        } catch (err) {
            console.error("Dashboard engine failure:", err);
            metricsBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-rose-500 font-bold">❌ Failed to load statistics table:<br>${err.message}</td></tr>`;
        }
    }

    const btnRefreshDashboard = document.getElementById("btnRefreshDashboard");
    if (btnRefreshDashboard) {
        btnRefreshDashboard.addEventListener("click", loadDashboardMetrics);
    }

    loadDashboardMetrics();
});