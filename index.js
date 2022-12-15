function $(selector){
    return document.querySelector(selector)
}

function $new(tag){
    return document.createElement(tag)
}

function addButton(text, ...types){
    let button = $new('button')
    button.innerText = text
    button.classList.add('button')
    for (let type of types){
        button.classList.add(type)
    }
    button.onclick = () => clickKey(text)
    $('.calc > .'+buttonWindow+' > .board').appendChild(button)
}

function updateScreen(){
    $('.calc > .main > .screen > .equation').innerText = exp
    $('.calc > .main > .screen > .pending').innerText = expAdd
}

function expPendingRemove(char){
    let index = expAdd.indexOf(char)
    expAdd = expAdd.slice(0, index) + expAdd.slice(index+1)
}

function expPendingAdd(char){
    expAdd = char + expAdd
}

function clickKey(key){
    if (expErr){
        exp = '0'
        expErr = false
    }
    let eChar = exp.charAt(exp.length - 1)
    if (key == '='){
        if (eChar == '.' || eChar == '(' || !'1234567890.()'.includes(eChar)){
            exp += '0'
        }
        let res = calc(exp+expAdd)
        exp = String(res)
        expAdd = ''
        if (typeof res == 'string'){
            expErr = true
        } else {
            if (exp.includes('e')){
                exp = 'Large Number'
                expErr = true
            }
            if (exp == 'NaN' || exp == 'Infinity'){
                expErr = true
            }
        }

    } else if (key == '<'){
        exp = exp.slice(0, exp.length-1)
        if (eChar == '('){
            expPendingRemove(')')
        } else if (eChar == ')'){
            expPendingAdd(')')
        }
        if (exp == ''){
            exp = '0'
        }

    } else if (key == 'C'){
        exp = '0'
        expAdd = ''

    } else {
        let add = true

        if ('1234567890'.includes(key)){
            if (exp == '0'){
                exp = ''
            } else {
                if (eChar == ')'){
                    exp += '*'
                } else if(eChar == '0' && !'1234567890.'.includes(exp.charAt(exp.length - 2))){
                    exp = exp.slice(0, exp.length - 1)
                }
            }

        } else if (key == '.'){
            if (eChar == ')'|| eChar == '.'){
                add = false
            } else if (!'1234567890'.includes(eChar) || eChar == ''){
                exp += '0'
            }

        } else if (key == '('){
            expPendingAdd(')')
            if (exp == '0'){
                exp = ''
            } else if (!(eChar == '')){
                if (eChar == '.'){
                    exp += '0*'
                } else if (eChar == ')'){
                    exp += '*'
                } else if ('1234567890'.includes(eChar)){
                    exp+='*'
                }
            }

        } else if (key == ')'){
            if (expAdd.includes(')')){
                if (eChar == '.' || eChar == '('){
                    exp += '0'
                } else if (!'1234567890.()'.includes(eChar)){
                    add = false
                }
                expPendingRemove(')')
            } else {
                add = false
            }

        } else {
            if (eChar == '.'){
                exp += '0'
            }

            if (key == '-' && (eChar == '(' || exp == '0')){
                if (exp == '0'){
                    exp = ''
                }
            } else if (eChar == '(' || !'1234567890.()'.includes(eChar) || eChar == ''){
                add = false
            }
        }
        if (add){
            exp += key
        }
    }
    updateScreen()
}

function calc(exp){
    let e, ex, s, t, tt, el, i, going = true;
    t = 0
    tt = 0
    el = []
    for(i of exp){
        if ('1234567890.'.includes(i)){ tt = 1 }
        else if ('()'.includes(i)){
            el.push(i)
            t = 0
            continue
        }
        else if (!(i == ' ')){ tt = 2 }
        else { continue }
        if (tt == t){
            el[el.length - 1] += i
        } else {
            el.push(i)
        }
        t = tt
    }
    while (going){
        e = el.indexOf(')')
        if (e > -1){
            ex = el.slice(0, e)
            s = ex.lastIndexOf('(')
            ex = ex.slice(s + 1)
        } else {
            e = el.length
            s = 0
            ex = [...el]
            going = false
        }

        while (true){
            let pos = {id:-1}
            for(let pr of ops){
                pos = {id:-1, i:-1}
                for(let opi = 0; opi < pr.length; opi++){
                    let i = ex.indexOf(pr[opi].text)
                    if ((i<pos.i || pos.i < 0) && i > -1){
                        pos = {id:opi, i:i}
                    }
                }
                if (pos.id > -1){
                    if (pos.i == 0){
                        ex.unshift('0')
                        pos.i+=1
                    }
                    let a = Number(ex[pos.i - 1])
                    let b = Number(ex[pos.i + 1])
                    a = isNaN(a)?0:a
                    b = isNaN(b)?0:b
                    ex.splice(pos.i-1, 3, String(pr[pos.id].f(a, b)))
                    break
                }
            }
            if (pos.id < 0 && ex.length == 3){
                return 'Error'
            }
            if (ex.length < 2){
                break
            }
        }
        el = [...el.slice(0, s),ex[0],...el.slice(e+1)]
    }
    return Number(el[0])
}


const ops = 
[[{text:'sin', f:(a,b)=>(Math.sin(b))},
{text:'cos', f:(a,b)=>(Math.cos(b))},
{text:'tan', f:(a,b)=>(Math.tan(b))},
{text:'cot', f:(a,b)=>(1/Math.tan(b))}],
[{text:'^', f:(a,b)=>(a**b)}],
[{text:'*', f:(a,b)=>(a*b)},
{text:'/', f:(a,b)=>(a/b)}],
[{text:'%', f:(a,b)=>(a%b)}],
[{text:'+', f:(a,b)=>(a+b)},
{text:'-', f:(a,b)=>(a-b)}]]
let exp = '0'
let expAdd = ''
let expErr = false
updateScreen()

window.addEventListener('keydown', event => {
    let key = event.key.toLowerCase()
    if ('1234567890.()+-*/%^'.includes(key)){
        clickKey(key)
    } else if (key == 'enter'){
        clickKey('=')
    } else if (key == 'backspace'){
        clickKey('<')
    }
})

let buttonWindow = 'main'
addButton('C', 'act', 'wide')
addButton('<', 'act', 'wide')
addButton('+', 'op')
addButton('-', 'op')
addButton('*', 'op')
addButton('/', 'op')
addButton('%', 'op')
addButton('^', 'op')
addButton('(', 'scope')
addButton(')', 'scope')
for (let i = 0; i < 10; i++){
    addButton(String(i), 'num')
}
addButton('.', 'num')
addButton('=', 'res')

buttonWindow = 'left'
addButton('sin', 'op', 'wide')
addButton('cos', 'op', 'wide')
addButton('tan', 'op', 'wide')
addButton('cot', 'op', 'wide')

$('.calc').addEventListener('mouseover', event => {
    event.stopPropagation()
    let rect = $('.calc > .main').getBoundingClientRect()
    if (event.x < rect.left){
        $('.calc > .left').classList.remove('hidden')
    } else if (event.x > rect.right){
        $('.calc > .right').classList.remove('hidden')
    } else {

    }
})

$('.calc > .main').addEventListener('mouseenter', event => {
    $('.calc > .left').classList.add('hidden')
    $('.calc > .right').classList.add('hidden')
    
    console.log('in')
})