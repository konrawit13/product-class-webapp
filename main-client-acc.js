function setBtnAction() {
    const btn_p1 = document.getElementById("main-btn1");
    btn_p1.addEventListener("click", () => {
        const main_container = document.querySelector('#container-btn1');
        main_container.innerHTML = '';
        main_container.innerHTML('<h1>loading..</h1>');
    });
}

function createRadioOpt(label, id, attr, opttype, uuid, cquid) {
  let radioOpt_div = document.createElement('input');
  radioOpt_div.classList.add("form-check-input");
  radioOpt_div.setAttribute('type', 'radio');
  radioOpt_div.setAttribute('name', 'flexRadioDefault');
  radioOpt_div.setAttribute('nextopt', attr); //custom attribute
  radioOpt_div.setAttribute('opttype', opttype); //custom attribute
  radioOpt_div.setAttribute('uuid', uuid); //custom attribute
  radioOpt_div.setAttribute('cqid', cquid); //custom attribute

  radioOpt_div.id = id;
  
  let lb = document.createElement('label');
  lb.innerText = label;
  lb.classList.add("form-check-label");
  lb.setAttribute('for', id);

  let div = document.createElement('div');
  div.classList.add("form-check");

  div.appendChild(radioOpt_div);
  div.appendChild(lb);
  return div;
}

/**
 * Function to create a form group
 * @returns {obj} - formElement
 *
*/
function createRadioOpts(arr, btn) {
  let elm_opts = arr.map( (r,i) => {
    let opt_el = createRadioOpt(r.option, 'q'+this.numberCounter+'A'+(i+1), r.next_id, r.outcome_type, r.uuid, r.idm);
    opt_el.addEventListener('change', () => {
      let isAnyRadioSelected = false;
      if (opt_el.checked) {
        isAnyRadioSelected = true;
      }
      btn.disabled = isAnyRadioSelected;
    });
    return opt_el;
  });
  let formEl = document.createElement('form');
  formEl.id = 'form-q';

  for (const e of elm_opts) {
    formEl.appendChild(e);
  }        
  return formEl;
}


class prodClassAcc {
    constructor() {
        this.url = "http://127.0.0.1:3000/prodClass_2025-5-29_rev5.json";
        this.data = null;
        this.numberCounter = 1;
        this.path = [];
        this.answer = {};
        this.loading = true; // Track loading state
        this.error = null;   // Track any errors
        this.fetchData();
        this.answer = {
        'path' : [],
        'outcome': {},
        'email':[]
        };
    }

    async fetchData() {
        try {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.data = await response.json(); // or response.text() if not JSON
        } catch (err) {
        this.error = err;
        console.error("Error fetching data:", err); // Handle error (e.g., display message)
        } finally {
        this.loading = false; // Set loading to false regardless of success/failure
        }
    }

    clone_acc() {
      const acc_temp = document.getElementById("accordionPanelsStayOpenTemplate");
      const clone_elm = acc_temp.cloneNode(true);
      clone_elm.classList.remove('visually-hidden');
      
      let allIdElements = clone_elm.querySelectorAll('[id]');
      allIdElements.forEach( (e) => {
          e.id = e.id + "-" + this.numberCounter
      });

      this.numberCounter++;
    return clone_elm;
}

    setAcceptBtn() {
        const acc_btn = document.getElementById("accept_btn");
        acc_btn.addEventListener("click", ()=> {
            this.init_btn();
            acc_btn.innerText = "✓";
            acc_btn.disabled = true;
        });
    }

    createContBtn() {
      let cont_btn = document.createElement('button');
      cont_btn.classList.add('btn', 'btn-primary');
      cont_btn.setAttribute('type','button');
      cont_btn.innerText = 'continue';

      cont_btn.disabled = true;
      return cont_btn
    }

    unhideTemplate() {
      document.querySelector('#question-targ').querySelector('accordionPanelsStayOpenTemplate').classList.remove('visually-hidden');
    }

    init_btn() {
        const clone_acc_elm = this.clone_acc();
        clone_acc_elm.querySelector('[class="acc_question"]').innerText = this.data.question[0].question;
        clone_acc_elm.querySelector('[class="edit-marker"]').classList.add('visually-hidden');
        
        let cont_btn = this.createContBtn();

        let q1optsArr = this.data.question[0].option;
        let formElm = createRadioOpts(q1optsArr, cont_btn);
        clone_acc_elm.querySelector('[id^="form-q"]').appendChild(formElm);
        document.querySelector('#question-targ').appendChild(clone_acc_elm);

        clone_acc_elm.querySelector('[id^="cont_btn"]').appendChild(cont_btn);
        this.attachNextEvent();
    }

    onFetchSuccess(blob) {
        const div = document.querySelector('#test_output');
        const span = document.createElement('span');
        span.innerText = blob;
        div.appendChild(span);

        let parsed = JSON.parse(blob);
        this.data = parsed;
        console.log(parsed);
        return parsed;
    }


  attachNextEvent() {
    let q_targ = document.querySelector('#question-targ');
    let qlst = q_targ.lastElementChild;
    qlst.querySelector('[id^="cont_btn"]').firstElementChild
      .addEventListener('click', () => {
        let sel = qlst.querySelector('input[name="flexRadioDefault"]:checked');
        console.log('adding new question');
        this.answer['path'].push(
          {
            'qn': qlst.querySelector('[id^="pill_num"]').firstElementChild.innerText,
            'q': qlst.querySelector('[class="acc_question"]').innerText,
            'cqid': sel.getAttribute('cqid'),
            'ans': sel.parentElement.querySelector('[class="form-check-label"]').innerText
          }
        );
              // get next next question attribute
      
        let nextQ = sel.getAttribute('nextopt');
        let optsType = sel.getAttribute('opttype');
        let nq_obj = this.getQuestionById(nextQ);
        if (optsType == 'terminal') {
          let uuid = sel.getAttribute('uuid');
          let opt = this.getOptByUUID(uuid);
          this.setTerminal(opt, qlst);
        } else {
          this.setNextQuestion(nq_obj, qlst);
        }

        // disable all form
        let allinput = qlst.querySelector('form').querySelectorAll('input');
        allinput.forEach( (e) => {
          if (e.disabled !== true) {
            e.disabled = true;
          }
        });
        
        qlst.querySelector('[class^="edit-marker"]').classList.remove('visually-hidden');
        this.setEditEvent(qlst);

        // hide continue button
        qlst.querySelector('[id^="cont_btn"]').firstElementChild.classList.add('visually-hidden');
      });
  }

  setNextQuestion(q_obj, qlst) {
    let clone_acc_elm = this.clone_acc();
    let pillnum = clone_acc_elm.querySelector('[id^="pill_num"]');
    let c_num = parseInt(pillnum.firstElementChild.innerText);
    c_num++;
    pillnum.firstElementChild.innerText = c_num;

    clone_acc_elm.querySelector('[class="acc_question"]').innerText = q_obj.question;

    let ctn_btn = this.createContBtn();
    let newOpts = createRadioOpts(q_obj.option, ctn_btn);

    clone_acc_elm.querySelector('[id^="form-q"]').appendChild(newOpts);
    

    clone_acc_elm.querySelector('[id^="cont_btn"]').appendChild(ctn_btn);

    clone_acc_elm.querySelector('[class^="edit-marker"]').classList.add('visually-hidden');

    qlst.insertAdjacentElement('afterend', clone_acc_elm);
    this.attachNextEvent();

  }

  setEditEvent(qlst) {
    let editbtn = qlst.querySelector('[class^="edit-marker"]');
    editbtn.addEventListener( 'click', ()=> {
      
      // 1st clear ui
      document.querySelector('#test_output').innerHTML = '';
      document.querySelector('#mail-textarea-div').innerHTML = '';

      let clicked_acc = editbtn.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

      while (clicked_acc.nextElementSibling) {
        clicked_acc.nextElementSibling.remove();
      }

      // enable all form
      let allinput = clicked_acc.querySelector('form').querySelectorAll('input');
      allinput.forEach( (e) => {
        if (e.disabled === true) {
          e.disabled = false;
        }
      });
      clicked_acc.querySelector('[id^="cont_btn"]').firstElementChild.classList.remove('visually-hidden');

      // 2nd update last edit point in answer object
      let pillnum = clicked_acc.querySelector('[id^="pill_num"]');
      let c_num = parseInt(pillnum.firstElementChild.innerText);
      let filtered_path = this.answer['path'].filter( (r) => parseInt(r.qn) < c_num);
      this.answer['path'] = filtered_path;

    });
  }


  setAnsDiv(targ) {
    const top_div = document.createElement('div');
    top_div.classList.add('row', 'ans-div-top');


    const col_div = document.createElement('div');
    col_div.classList.add('col');

    for ( const aw of this.answer.path) {
      const div_row1 = document.createElement('div');
      div_row1.classList.add('ans-div');

      const qtopic = document.createElement('span');
      qtopic.classList.add('ans-topic1');
      qtopic.innerText = 'คำถาม: ';
      
      const qspan = document.createElement('span');
      qspan.classList.add('ans-q-style1');
      qspan.innerText = aw.q;

      const div_row2 = document.createElement('div');
      div_row2.classList.add('row', 'ans-div');

      const topic_div_col_auto = document.createElement('div');
      topic_div_col_auto.classList.add('col-auto');

      const anstopic = document.createElement('span');
      anstopic.classList.add('ans-topic2');
      anstopic.innerText = 'คำตอบ: ';
      topic_div_col_auto.append(anstopic);

      const ans_div_col_auto = document.createElement('div');
      ans_div_col_auto.classList.add('col-auto');
      const ansContent = document.createElement('span');
      ansContent.innerText = aw.ans;
      ans_div_col_auto.appendChild(ansContent);



      div_row1.appendChild(qtopic);
      div_row1.appendChild(qspan);

      div_row2.appendChild(topic_div_col_auto);
      div_row2.appendChild(ans_div_col_auto);

      col_div.appendChild(div_row1);
      col_div.appendChild(div_row2);
    }

    top_div.appendChild(col_div);
    targ.appendChild(top_div);
  }

  setAnsSpan(targ) {
    let ansSpan = document.createElement('span');
    ansSpan.innerText = JSON.stringify(this.answer);
    ansSpan.classList.add('visually-hidden');
    targ.appendChild(ansSpan);
  }

  setTerminal(opt, dq) {

    let border = document.createElement('div');
    border.classList.add('results-container');

    let topicCol = document.createElement('div');
    topicCol.classList.add('col-auto');

    let topicSpan = document.createElement('span');
    topicSpan.innerText = 'ผลการวินิจฉัยเบื้องต้น:';
    topicSpan.classList.add('res-topic-tile');
    topicCol.appendChild(topicSpan);

    this.answer['outcome'] = {'product_class': opt.outcome, 'uuid': opt.uuid, 'lastUpdate': this.data.data_fetch_datetime, 'version': this.data.rev}; // set outcome

    let outcomeDiv = document.createElement('div');
    outcomeDiv.classList.add('col-auto');
    let outcomeSpan = document.createElement('span');
    outcomeSpan.innerText = opt.outcome;
    outcomeSpan.classList.add('res-outcome', 'bg-success');
    outcomeDiv.appendChild(outcomeSpan);

    let uuidDiv = document.createElement('div');
    uuidDiv.classList.add('col-auto');
    let uuid_span = document.createElement('span');
    uuid_span.innerText = 'path : '+ opt.uuid;
    uuid_span.classList.add('span-results');
    uuidDiv.appendChild(uuid_span);
    
    let divInLine = document.createElement('div');
    divInLine.classList.add('row', 'd-flex');

    divInLine.appendChild(topicCol);
    divInLine.appendChild(outcomeDiv);
    divInLine.appendChild(uuidDiv);

    border.appendChild(divInLine);
    
    let testSpan = document.querySelector('#test_output');
    
    this.setAnsSpan(border);
    this.setAnsDiv(border);
    this.setEmailTextarea();

    testSpan.appendChild(border);
  }

  getQuestionById(id) {
    return this.data.question.filter( r => r.id == id)[0];
  }

  onSubmitSuccess(resId) {
    const status_div = document.querySelector('#response-status');
    const span = document.createElement('span');
    span.classList.add('on-success-text1');

    span.innerText = 'The information have been recorded. An automatic email  (Response id: '+resId+' ) will be send within 15-minutes.';
    status_div.appendChild(span);
  }

  getPrdInfo() {
    let prd_info = {
      "product_name": document.getElementById("prd_name1").value,
      "product_indication": document.getElementById("ind_name1").value
    };
    let prd_type;
    try {
      prd_type = document.querySelector('input[name="flexRadioDefault_prd_type"]:checked').parentElement.querySelector('[class="form-check-label"]').innerText;
    } catch(e) {
      prd_type = "";
    }
    prd_info["product_type"] = prd_type;

    return prd_info;
  }

  enableoptin() {
    const divoptin = document.getElementById("opt-in-question");
    divoptin.classList.remove("visually-hidden");
  }

  setEmailTextarea() {
    let formDiv = document.querySelector('#mail-textarea-div');
    let formElm = document.createElement('form');
    let divmb = document.createElement('div');
    divmb.classList.add('mb-3');

    let mbid = `mb3_${this.numberCounter}`;
    let mblabel = document.createElement('label');
    mblabel.classList.add('form-label');
    mblabel.innerText = 'Email Address:';
    mblabel.setAttribute('for', mbid);
    this.numberCounter++;

    let mbinput = document.createElement('input');
    mbinput.classList.add('form-control');
    mbinput.setAttribute('type', 'email');
    mbinput.setAttribute('aria-describedby', 'emailHelp');
    mbinput.id = mbid;

    let helper = document.createElement('div');
    helper.id = 'emailHelp';
    helper.classList.add('form-text');
    helper.innerText = 'This presumptive health product classification request is finished. In case the information above are required for recording or any further processing, please fill-in email address.';

    let submit_btn = document.createElement('button');
    submit_btn.classList.add('btn', 'btn-dark');
    submit_btn.innerText = 'submit';

    let a_btn = document.createElement('a');
    a_btn.setAttribute('role','button');
    a_btn.classList.add('text-decoration-none', 'd-flex', 'justify-content-center');
    a_btn.innerText = "+ add another email";
    a_btn.addEventListener('click', () =>{
      let clone_input = mbinput.cloneNode(true);
      clone_input.id = mbinput.id+this.numberCounter;
      this.numberCounter++;
      clone_input.classList.add('mt-1');
      const hookElm = document.getElementById(mbinput.id);
      hookElm.insertAdjacentElement('afterend', clone_input);
    });

    submit_btn.addEventListener('click', () => {
      const allinputmb = divmb.querySelectorAll('.form-control');
      allinputmb.forEach( (inputb) => {
        let emailAddress = inputb.value;
        this.answer['email'].push(emailAddress);
      });

      let prdinfo = this.getPrdInfo();

      this.answer["product_info"] = prdinfo;
      
      console.log(this.answer);

      // google.script.run
      //   .withSuccessHandler(this.onSubmitSuccess)
      //   .retrieveResponse(JSON.stringify(this.answer));
    });

    

    divmb.appendChild(mblabel);
    divmb.appendChild(mbinput);
    divmb.appendChild(a_btn);
    divmb.appendChild(helper);

    formElm.appendChild(divmb);

    formDiv.appendChild(formElm);
    formDiv.appendChild(submit_btn);

    this.enableoptin();
  }

  getOptByUUID(uuid) {
    for ( const q of this.data.question) {
      for (const opt of q.option) {
        if (opt.uuid == uuid) {
          return opt;
        }
      }
    }
    console.log('tried search for uuid: '+uuid+', option object was not found');
  }
}

// Object entrypoints:
document.addEventListener('DOMContentLoaded', () => {
    const formData = new prodClassAcc();
    formData.setAcceptBtn();
});