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

    //   $("#surveyContainer").html(""); // נקה
      $("#surveyContainer").Survey({ model: displaySurvey });

      if (formName === "tikshuv" || formName === "exit") {
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

        if (tikshuvData["פלוגה"] && Array.isArray(tikshuvData["פלוגה"]) && tikshuvData["פלוגה"].length > 0) {
            tikshuvData["פלוגה"] = tikshuvData["פלוגה"][0]; // שמירה על הבחירה הראשונה
        }

        // console.log("before" + JSON.stringify(data, null, 2));
        // console.log("after" + JSON.stringify(tikshuvData));

        let url = "";
        if (formName === "exit") {
            url = "https://script.google.com/macros/s/AKfycbzGH2naFum2o05Ugn8ZnvS6LWl1jFXlW4FX8ZQUmgBOFHAno7n9kB8cvKP-bSR8rNgS/exec";
        } else {
            url = "https://script.google.com/macros/s/AKfycbylh5l7ev_a3NC_pZaDAEEpJPoQM-FPqrtnpjMM--FpzNSJKh-Y3cNMckPi3OxQweYw8g/exec";
        }

        fetch(url, {
            method: "POST",
            body: JSON.stringify(tikshuvData),
            headers: {
                "Content-Type": "text/plain;charset=UTF-8"
            }
          })
//           .then(response => response.text())
//            .then(result => console.log("Saved:", result))
//              .catch(error => console.error("Error:", error));
      }

      const phoneNumber = data["טלפון"]?.replace(/[^0-9]/g, "").replace(/^0+/, ''); // מסנן רק ספרות
      if (phoneNumber && formName !== "exit") {
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
