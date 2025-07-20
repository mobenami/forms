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
      const data = sender.data;
      const displaySurvey = new Survey.Model(surveyJSON);
      displaySurvey.data = data;
      displaySurvey.mode = "display";

      $("#surveyContainer").html(""); // נקה
      $("#surveyContainer").Survey({ model: displaySurvey });

      if (formName === "tikshuv") {
        const tikshuvData = JSON.parse(JSON.stringify(data));
        // "openedList": [
        //     {
        //       "item": "פריט",
        //       "quantity": 4
        //     }
        //   ],
        if (tikshuvData.openedList) {
          tikshuvData.openedList.forEach(element => {
            tikshuvData[element.item] = element.quantity;
          });
          delete tikshuvData.openedList;
        }

        // "closedList": {
        //     "שולחן": {
        //       "quantity": 4
        //     }
        //   },          
        if (tikshuvData.closedList) {
            for (const [key, value] of Object.entries(tikshuvData.closedList)) {
                tikshuvData[key] = value.quantity;
            }
            delete tikshuvData.closedList;
        }

        console.log("before" + JSON.stringify(data, null, 2));
        console.log("after" + JSON.stringify(tikshuvData));

        fetch("https://script.google.com/macros/s/AKfycbylh5l7ev_a3NC_pZaDAEEpJPoQM-FPqrtnpjMM--FpzNSJKh-Y3cNMckPi3OxQweYw8g/exec", {
            method: "POST",
            body: JSON.stringify(tikshuvData),
            headers: {
              "Content-Type": "application/json",
            }
          })
//           .then(response => response.text())
//            .then(result => console.log("Saved:", result))
//              .catch(error => console.error("Error:", error));
      }

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
