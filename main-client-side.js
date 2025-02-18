
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
function createRadioOpts(arr) {
  let elm_opts = arr.map( (r,i) => {
    let opt_el = createRadioOpt(r.option, 'q'+this.numberCounter+'A'+(i+1), r.next_id, r.outcome_type, r.uuid, r.id);
    return opt_el;
  });
  let formEl = document.createElement('form');
  formEl.id = 'form-q';

  for (const e of elm_opts) {
    formEl.appendChild(e);
  }        
  return formEl;
}



class prodClass {
  constructor() {
    this.url = "http://127.0.0.1:3000/prodClass_2025-2-18_rev4.json";
    this.data = null;
    this.numberCounter = 1;
    this.path = [];
    this.answer = {};
    this.loading = true; // Track loading state
    this.error = null;   // Track any errors
    this.fetchData();
    this.answer = {
      'path' : [],
      'outcome': {}
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

  init_btn() {
    const elm = document.createElement('button');
    elm.innerText = "Accept";
    elm.classList.add("btn", "btn-primary");
    elm.id = 'accept_btn';

    elm.addEventListener('click',() => {
      this.init_question();
    });

    const target = document.querySelector('#init_btn');
    target.appendChild(elm);
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

  init_question() {
    let dq = document.querySelector('#dynamic_qcontext');
    dq.innerHTML = '';

    let nextBTN = document.createElement('button');
    nextBTN.innerText ='Next';
    nextBTN.classList.add("btn", "btn-primary");
    nextBTN.id = 'next_btn';

    this.attachNextEvent(nextBTN);

    let nextBTNwrapper_div = document.createElement('div');
    nextBTNwrapper_div.appendChild(nextBTN);

    let q_div = document.createElement('div');

    let q_span = document.createElement('span');
    q_span.innerText = this.data.question[0].question;
    q_span.classList.add("question-num");
    q_span.id = 'q_span1';

    let num_pill = document.createElement('span');
    num_pill.innerText = this.numberCounter;
    num_pill.classList.add("badge", "rounded-pill", "bg-dark");
    num_pill.id = 'num_pill1';

    q_div.appendChild(num_pill);
    q_div.appendChild(q_span);
    dq.appendChild(q_div);
    
    let q1optsArr = this.data.question[0].option;
    let formElm = createRadioOpts(q1optsArr);

    dq.appendChild(formElm);
    
    dq.appendChild(nextBTNwrapper_div);
  }

  attachNextEvent(btn) {

    btn.addEventListener("click", () => {
      let dq = document.querySelector('#dynamic_qcontext');
      let sel = dq.querySelector('input[name="flexRadioDefault"]:checked');
      this.answer['path'].push(
        {
          'q': dq.querySelector('#q_span1').innerText,
          'qn': dq.querySelector('#num_pill1').innerText,
          'cqid': sel.getAttribute('cqid'),
          'ans': sel.parentElement.querySelector('[class="form-check-label"]').innerText
        }
      );
      this.numberCounter++;

      // get next next question attribute
      
      let nextQ = sel.getAttribute('nextopt');
      let optsType = sel.getAttribute('opttype');
      let nq_obj = this.getQuestionById(nextQ);
      if (optsType == 'terminal') {
        let uuid = sel.getAttribute('uuid');
        let opt = this.getOptByUUID(uuid);
        this.setTerminal(opt, dq);
      } else {
        this.setPageNextQuestion(nq_obj, dq);
      }
      
    });
  }

  setPageNextQuestion(q_obj, fragment) {
    fragment.querySelector('#num_pill1').innerText = this.numberCounter;
    fragment.querySelector('#q_span1').innerText = q_obj.question;
    let newOpts = createRadioOpts(q_obj.option);
    let formQ = document.querySelector('#form-q');
    formQ.innerHTML = '';

    let optsChildren = [...newOpts.children] // using spread operation for turn HTMLCollection into array for iteration.
    for (const e of optsChildren) {
      formQ.appendChild(e);
    }

  }

  setAnsDiv(targ) {
    const top_div = document.createElement('div');
    top_div.classList.add('row', 'ans-div-top', 'd-block');


    const col_div = document.createElement('div');
    col_div.classList.add('col');

    for ( const aw of this.answer.path) {
      const div_row1 = document.createElement('div');
      div_row1.classList.add('row', 'ans-div', 'd-block');

      const qtopic = document.createElement('span');
      qtopic.classList.add('ans-topic1');
      qtopic.innerText = 'คำถาม: ';
      

      const qspan = document.createElement('span');
      qspan.classList.add('ans-q-style1');
      qspan.innerText = aw.q;

      const div_row2 = document.createElement('div');
      div_row2.classList.add('row', 'ans-div', 'd-block');

      const anstopic = document.createElement('span');
      anstopic.classList.add('ans-topic2');
      anstopic.innerText = 'คำตอบ: ';

      const ansContent = document.createElement('span');
      ansContent.innerText = aw.ans;

      div_row1.appendChild(qtopic);
      div_row1.appendChild(qspan);

      div_row2.appendChild(anstopic);
      div_row2.appendChild(ansContent);

      col_div.appendChild(div_row1);
      col_div.appendChild(div_row2);
    }

    top_div.appendChild(col_div);
    targ.insertAdjacentElement('afterend', top_div);
  }

  setAnsSpan(targ) {
    let ansSpan = document.createElement('span');
    ansSpan.innerText = JSON.stringify(this.answer);
    targ.insertAdjacentElement('afterend', ansSpan);
  }

  setTerminal(opt, dq) {
    let topicSpan = document.createElement('span');
    topicSpan.innerText = 'ผลการวินิจฉัยเบื้องต้น:';
    topicSpan.classList.add('res-topic-tile');
    let outcomeSpan  = document.createElement('span');

    this.answer['outcome'] = {'product_class': opt.outcome, 'uuid': opt.uuid, 'lastUpdate': this.data.data_fetch_datetime, 'version': this.data.rev}; // set outcome

    outcomeSpan.innerText = opt.outcome;
    outcomeSpan.classList.add('res-outcome', 'bg-success');
    dq.innerHTML = '';

    dq.appendChild(topicSpan);
    dq.appendChild(outcomeSpan);

    let testSpan = document.querySelector('#test_output');
    
    
    let uuid_span = document.createElement('span');
    uuid_span.innerText = ': '+ opt.uuid;

    
    this.setAnsSpan(testSpan);
    this.setAnsDiv(testSpan);
    this.setEmailTextarea();

    testSpan.appendChild(uuid_span);
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

  setEmailTextarea() {
    let formDiv = document.querySelector('#mail-textarea-div');
    let formElm = document.createElement('form');
    let divmb = document.createElement('div');
    divmb.classList.add('mb-3');

    let mbid = 'mb3';
    let mblabel = document.createElement('label');
    mblabel.classList.add('form-label');
    mblabel.innerText = 'Email Address:';
    mblabel.setAttribute('for', mbid);

    let mbinput = document.createElement('input');
    mbinput.classList.add('form-control');
    mbinput.setAttribute('type', 'email');
    mbinput.setAttribute('aria-describedby', 'emailHelp');
    mbinput.id = mbid;

    let helper = document.createElement('div');
    helper.id = 'emailHelp';
    helper.classList.add('form-text');
    helper.innerText = 'This presumptive health product classification request is finished. In case the information above are required for recording or future processing, please fill-in email address.';

    let submit_btn = document.createElement('button');
    submit_btn.classList.add('btn', 'btn-dark');
    submit_btn.innerText = 'submit';

    submit_btn.addEventListener('click', () => {
      let emailAddress = document.querySelector('#mb3').value;
      this.answer['email'] = emailAddress;

      google.script.run
        .withSuccessHandler(this.onSubmitSuccess)
        .retrieveResponse(JSON.stringify(this.answer));
    });

    divmb.appendChild(mblabel);
    divmb.appendChild(mbinput);
    divmb.appendChild(helper);

    formElm.appendChild(divmb);

    formDiv.appendChild(formElm);
    formDiv.appendChild(submit_btn);
  }

  getQuestionById(id) {
    return this.data.question.filter( r => r.id == id)[0];
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
  const formData = new prodClass();
  formData.init_btn();
})

