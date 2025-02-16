
    <script>

      /**
      *
      */
      function createRadioOpt(label, id, attr) {
        let radioOpt_div = document.createElement('input');
        radioOpt_div.classList.add("form-check-input");
        radioOpt_div.setAttribute('type', 'radio');
        radioOpt_div.setAttribute('name', 'flexRadioDefault');
        radioOpt_div.setAttribute('nextopt', attr); //custom attribute
        radioOpt_div.id = id;

        let lb = document.createElement('label');
        lb.innerText = label;
        lb.classList.add("orm-check-label");
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
          let opt_el = createRadioOpt(r.option, 'q'+this.numberCounter+'A'+(i+1), r.next_id);
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
          document.addEventListener('DOMContentLoaded', () => {
            this.init_btn();
            this.data = google.script.run
              .withSuccessHandler(this.onFetchSuccess.bind(this))
              .fetchDriveJSON('17NylBIKBsGIBpKqXIgyxv51sslPnl9wF');
          });
          this.numberCounter = 1;
          this.path = [];
          this.answer = {};
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
            this.numberCounter++;
            let dq = document.querySelector('#dynamic_qcontext');

            // get next next question attribute
            let nextQ = dq.querySelector('input[name="flexRadioDefault"]:checked').getAttribute('nextopt');
            let nq_obj = this.getQuestionById(nextQ);

            this.setPageNextQuestion(nq_obj, dq);
            
          })
        }

        setPageNextQuestion(q_obj, fragment) {
          fragment.querySelector('#num_pill1').innerText = this.numberCounter;
          fragment.querySelector('#q_span1').innerText = q_obj.question;
          let newOpts = createRadioOpts(q_obj.option);
          let formQ = document.querySelector('#form-q');
          formQ.innerHTML = '';

          for (const e of newOpts.children) {
            formQ.appendChild(e);
          }

        }

        getQuestionById(id) {
          return this.data.question.filter( r => r.id == id)[0];
        }

      }


      const formData = new prodClass();
    </script>
