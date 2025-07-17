// ניתוח שם הטופס מהכתובת
const formName = new URLSearchParams(window.location.search).get("form") || "default";

// טעינת קובץ JSON מהתיקיה
fetch(`forms/${formName}.json`)
  .then(res => res.json())
  .then(surveyJSON => {
    const survey = new Survey.Model(surveyJSON);
    survey.locale = "he";
    survey.rightToLeft = true;

    // תצוגה
    $("#surveyContainer").Survey({ model: survey });

    // בעת סיום
    survey.onComplete.add(sender => {

//         const data = sender.data;
        
//         const displaySurvey = new Survey.Model(surveyJSON);
//         displaySurvey.data = data;
//         displaySurvey.mode = "display"; // 🟡 מצב תצוגה בלבד – בלי כפתור Submit
    
//         $("#surveyContainer").html(""); // ננקה
//         $("#surveyContainer").Survey({ model: displaySurvey });



    
//         // שמירה כתמונה אוטומטית
//         setTimeout(() => {
//             html2canvas(document.getElementById("surveyContainer")).then(canvas => {
//             const link = document.createElement("a");
//             link.download = "טופס_רישום.png";
//             link.href = canvas.toDataURL("image/png");
//             link.click();
//         });
//     }, 500);
// });


      const data = sender.data;
      const displaySurvey = new Survey.Model(surveyJSON);
      displaySurvey.data = data;
      displaySurvey.mode = "display";

      $("#surveyContainer").html(""); // נקה
      $("#surveyContainer").Survey({ model: displaySurvey });

      const phoneNumber = data.phone?.replace(/[^0-9]/g, "").replace(/^0+/, ''); // מסנן רק ספרות
      if (phoneNumber) {
          window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent("ההשאלה נרשמה")}`, "_blank");
      }

      // צילום אוטומטי
      setTimeout(() => {
        html2canvas(document.getElementById("surveyContainer")).then(canvas => {
          const link = document.createElement("a");
          link.download = "טופס_רישום.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        });
      }, 500);
    });
  })
  .catch(err => {
    document.getElementById("surveyContainer").innerText =
      "שגיאה בטעינת הטופס. ודא שקובץ ה-JSON קיים בתיקיה.";
    console.error(err);
  });
