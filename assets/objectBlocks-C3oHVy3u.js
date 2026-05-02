import{c as d,n as r,r as t}from"./vendor-blockly-M6kB7b8H.js";var n="#FFB4C8",l="#6B5CE7",a="#c879ff",i="#FFD43C",p="#48c774",s="#A9D8FF",c=!1;function u(){if(c)return;c=!0,d([{type:"obj_on_start",message0:"🎬 при запуске сцены %1 %2",args0:[{type:"input_dummy"},{type:"input_statement",name:"DO"}],colour:n,tooltip:"Срабатывает один раз когда игрок заходит в Test-режим",helpUrl:""},{type:"obj_on_touch",message0:"👋 когда игрок коснулся %1 %2",args0:[{type:"input_dummy"},{type:"input_statement",name:"DO"}],colour:n,tooltip:"Срабатывает когда игрок дотронулся до этого объекта"},{type:"obj_on_click",message0:"🖱 когда игрок кликнул по мне %1 %2",args0:[{type:"input_dummy"},{type:"input_statement",name:"DO"}],colour:n,tooltip:"Срабатывает по клику мыши по этому объекту"},{type:"obj_on_key",message0:"⌨ когда нажата %1 %2 %3",args0:[{type:"field_dropdown",name:"KEY",options:[["пробел","Space"],["W — вверх","KeyW"],["S — вниз","KeyS"],["A — влево","KeyA"],["D — вправо","KeyD"],["E","KeyE"],["F","KeyF"],["Q","KeyQ"],["R","KeyR"],["1","Digit1"],["2","Digit2"],["3","Digit3"]]},{type:"input_dummy"},{type:"input_statement",name:"DO"}],colour:n,tooltip:"Срабатывает при нажатии клавиши во время Test/Play"},{type:"obj_on_tick",message0:"🔁 каждые %1 сек %2 %3",args0:[{type:"field_number",name:"SECONDS",value:1,min:.1,max:60,precision:.1},{type:"input_dummy"},{type:"input_statement",name:"DO"}],colour:n,tooltip:"Повторяется с интервалом"},{type:"obj_on_broadcast",message0:"📻 когда получен сигнал %1 %2 %3",args0:[{type:"field_input",name:"NAME",text:"открыть_дверь"},{type:"input_dummy"},{type:"input_statement",name:"DO"}],colour:n,tooltip:"Срабатывает когда другой объект разослал такой же сигнал"},{type:"obj_move",message0:"сдвинуть себя на x:%1 y:%2 z:%3",args0:[{type:"field_number",name:"DX",value:0},{type:"field_number",name:"DY",value:1},{type:"field_number",name:"DZ",value:0}],previousStatement:null,nextStatement:null,colour:l,tooltip:"Сдвигает ЭТОТ объект относительно текущей позиции"},{type:"obj_set_position",message0:"встать в x:%1 y:%2 z:%3",args0:[{type:"field_number",name:"X",value:0},{type:"field_number",name:"Y",value:1},{type:"field_number",name:"Z",value:0}],previousStatement:null,nextStatement:null,colour:l,tooltip:"Абсолютная позиция — мгновенная телепортация"},{type:"obj_glide_to",message0:"✨ плавно к x:%1 y:%2 z:%3 за %4 сек",args0:[{type:"field_number",name:"X",value:0},{type:"field_number",name:"Y",value:1},{type:"field_number",name:"Z",value:0},{type:"field_number",name:"SECONDS",value:1,min:.1,max:30,precision:.1}],previousStatement:null,nextStatement:null,colour:l,tooltip:"Плавная анимация перемещения (интерполяция)"},{type:"obj_rotate",message0:"повернуть себя на %1 °",args0:[{type:"field_number",name:"DEG",value:90}],previousStatement:null,nextStatement:null,colour:l,tooltip:"Поворот по Y-оси"},{type:"obj_set_scale",message0:"размер себя = %1",args0:[{type:"field_number",name:"S",value:1,min:.1,max:10,precision:.1}],previousStatement:null,nextStatement:null,colour:l,tooltip:"Равномерный масштаб (1 = исходный)"},{type:"obj_change_size_by",message0:"изменить размер на %1",args0:[{type:"field_number",name:"DELTA",value:.1,precision:.01}],previousStatement:null,nextStatement:null,colour:l,tooltip:"Инкремент масштаба (+ увеличить, − уменьшить)"},{type:"obj_set_color",message0:"цвет себя %1",args0:[{type:"field_dropdown",name:"COLOR",options:[["🟥 красный","red"],["🟦 синий","blue"],["🟩 зелёный","green"],["🟨 жёлтый","yellow"],["🟪 фиолет","purple"],["🟧 оранжевый","orange"],["⬛ чёрный","black"],["⬜ белый","white"],["🌸 розовый","pink"],["🔵 голубой","cyan"]]}],previousStatement:null,nextStatement:null,colour:a,tooltip:"Перекрасить ЭТОТ объект"},{type:"obj_say",message0:"сказать %1",args0:[{type:"field_input",name:"TEXT",text:"Привет!"}],previousStatement:null,nextStatement:null,colour:a,tooltip:"Показать floating-текст над собой"},{type:"obj_hide",message0:"🫥 спрятать себя",previousStatement:null,nextStatement:null,colour:a,tooltip:"Сделать невидимым (остаётся на сцене)"},{type:"obj_show",message0:"👁 показать себя",previousStatement:null,nextStatement:null,colour:a,tooltip:"Снять скрытие"},{type:"obj_flash",message0:"✨ мигнуть цветом %1 на %2 сек",args0:[{type:"field_dropdown",name:"COLOR",options:[["🟨 жёлтый","yellow"],["🟥 красный","red"],["🟦 синий","blue"],["🟩 зелёный","green"],["🌸 розовый","pink"],["🔵 голубой","cyan"],["⬜ белый","white"]]},{type:"field_number",name:"SECONDS",value:.3,min:.05,max:5,precision:.05}],previousStatement:null,nextStatement:null,colour:a,tooltip:"Кратковременно перекрасить, затем вернуть исходный цвет"},{type:"obj_wait",message0:"⏱ подождать %1 сек",args0:[{type:"field_number",name:"SECONDS",value:1,min:.1,max:10,precision:.1}],previousStatement:null,nextStatement:null,colour:i,tooltip:"Пауза перед следующей командой"},{type:"obj_broadcast",message0:"📡 отправить сигнал %1",args0:[{type:"field_input",name:"NAME",text:"открыть_дверь"}],previousStatement:null,nextStatement:null,colour:i,tooltip:"Разослать сигнал всем другим объектам. Ловят через «когда получен сигнал»."},{type:"obj_destroy",message0:"💥 удалить себя",previousStatement:null,colour:i,tooltip:"Убрать ЭТОТ объект со сцены навсегда"},{type:"obj_stop_all",message0:"⏹ остановить всё",previousStatement:null,colour:i,tooltip:"Остановить все on_tick и очередь команд"},{type:"obj_random_int",message0:"случайное число от %1 до %2",args0:[{type:"input_value",name:"FROM",check:"Number"},{type:"input_value",name:"TO",check:"Number"}],inputsInline:!0,output:"Number",colour:p,tooltip:"Случайное целое число в диапазоне"},{type:"obj_player_say",message0:"💬 игрок сказал %1",args0:[{type:"field_input",name:"TEXT",text:"Добро пожаловать!"}],previousStatement:null,nextStatement:null,colour:s,tooltip:"Floating-текст над игроком"},{type:"obj_set_sky",message0:"🌤 небо = %1",args0:[{type:"field_dropdown",name:"PRESET",options:[["☀ день","day"],["🌇 вечер","evening"],["🌙 ночь","night"],["☁ облачно","cloudy"],["🚀 космос","space"]]}],previousStatement:null,nextStatement:null,colour:s,tooltip:"Поменять освещение/небо сцены"},{type:"obj_add_score",message0:"💰 очки + %1",args0:[{type:"field_number",name:"N",value:1,min:-999,max:999}],previousStatement:null,nextStatement:null,colour:s,tooltip:"Увеличить счётчик очков"},{type:"obj_set_score",message0:"💰 очки = %1",args0:[{type:"field_number",name:"N",value:0,min:0,max:9999}],previousStatement:null,nextStatement:null,colour:s,tooltip:"Установить точное значение очков"}]);const o=e=>{const _=t.statementToCode(e,"DO");return _.length?_:`    pass
`};t.forBlock.obj_on_start=e=>`def on_start():
${o(e)}
`,t.forBlock.obj_on_touch=e=>`def on_touch():
${o(e)}
`,t.forBlock.obj_on_click=e=>`def on_click():
${o(e)}
`,t.forBlock.obj_on_key=e=>`def on_key_${String(e.getFieldValue("KEY")||"Space")}():
${o(e)}
`,t.forBlock.obj_on_tick=e=>`# on_tick interval: ${Number(e.getFieldValue("SECONDS"))||1}s
def on_tick():
${o(e)}
`,t.forBlock.obj_on_broadcast=e=>`def on_${String(e.getFieldValue("NAME")||"msg").replace(/[^a-zA-Z_а-яА-Я0-9]/g,"_")}():
${o(e)}
`,t.forBlock.obj_move=e=>`    this.move(${Number(e.getFieldValue("DX"))||0}, ${Number(e.getFieldValue("DY"))||0}, ${Number(e.getFieldValue("DZ"))||0})
`,t.forBlock.obj_set_position=e=>`    this.set_position(${Number(e.getFieldValue("X"))||0}, ${Number(e.getFieldValue("Y"))||0}, ${Number(e.getFieldValue("Z"))||0})
`,t.forBlock.obj_glide_to=e=>`    this.glide_to(${Number(e.getFieldValue("X"))||0}, ${Number(e.getFieldValue("Y"))||0}, ${Number(e.getFieldValue("Z"))||0}, ${Number(e.getFieldValue("SECONDS"))||1})
`,t.forBlock.obj_rotate=e=>`    this.rotate(${Number(e.getFieldValue("DEG"))||0})
`,t.forBlock.obj_set_scale=e=>`    this.set_scale(${Number(e.getFieldValue("S"))||1})
`,t.forBlock.obj_change_size_by=e=>`    this.change_size_by(${Number(e.getFieldValue("DELTA"))||0})
`,t.forBlock.obj_set_color=e=>`    this.set_color("${String(e.getFieldValue("COLOR")||"red")}")
`,t.forBlock.obj_say=e=>`    this.say("${String(e.getFieldValue("TEXT")??"").replace(/"/g,'\\"')}")
`,t.forBlock.obj_hide=()=>`    this.hide()
`,t.forBlock.obj_show=()=>`    this.show()
`,t.forBlock.obj_flash=e=>`    this.flash("${String(e.getFieldValue("COLOR")||"yellow")}", ${Number(e.getFieldValue("SECONDS"))||.3})
`,t.forBlock.obj_wait=e=>`    this.wait(${Number(e.getFieldValue("SECONDS"))||1})
`,t.forBlock.obj_broadcast=e=>`    this.broadcast("${String(e.getFieldValue("NAME")||"msg").replace(/"/g,'\\"')}")
`,t.forBlock.obj_destroy=()=>`    this.destroy()
`,t.forBlock.obj_stop_all=()=>`    this.stop_all()
`,t.forBlock.obj_random_int=e=>[`_randint(${t.valueToCode(e,"FROM",r.NONE)||"1"}, ${t.valueToCode(e,"TO",r.NONE)||"10"})`,r.FUNCTION_CALL],t.forBlock.obj_player_say=e=>`    this.player_say("${String(e.getFieldValue("TEXT")??"").replace(/"/g,'\\"')}")
`,t.forBlock.obj_set_sky=e=>`    this.set_sky("${String(e.getFieldValue("PRESET")||"day")}")
`,t.forBlock.obj_add_score=e=>`    this.add_score(${Number(e.getFieldValue("N"))||1})
`,t.forBlock.obj_set_score=e=>`    this.set_score(${Number(e.getFieldValue("N"))||0})
`,r.ATOMIC}var y={kind:"categoryToolbox",contents:[{kind:"category",name:"🎬 События",colour:n,contents:[{kind:"block",type:"obj_on_start"},{kind:"block",type:"obj_on_touch"},{kind:"block",type:"obj_on_click"},{kind:"block",type:"obj_on_key"},{kind:"block",type:"obj_on_tick"},{kind:"block",type:"obj_on_broadcast"}]},{kind:"category",name:"🏃 Движение",colour:l,contents:[{kind:"block",type:"obj_move"},{kind:"block",type:"obj_set_position"},{kind:"block",type:"obj_glide_to"},{kind:"block",type:"obj_rotate"},{kind:"block",type:"obj_set_scale"},{kind:"block",type:"obj_change_size_by"}]},{kind:"category",name:"🎨 Внешний вид",colour:a,contents:[{kind:"block",type:"obj_set_color"},{kind:"block",type:"obj_flash"},{kind:"block",type:"obj_say"},{kind:"block",type:"obj_hide"},{kind:"block",type:"obj_show"}]},{kind:"category",name:"🎛 Управление",colour:i,contents:[{kind:"block",type:"obj_wait"},{kind:"block",type:"obj_broadcast"},{kind:"block",type:"obj_destroy"},{kind:"block",type:"obj_stop_all"}]},{kind:"category",name:"🔁 Циклы",colour:"#FFAB19",contents:[{kind:"block",type:"controls_repeat_ext"},{kind:"block",type:"controls_whileUntil"},{kind:"block",type:"controls_for"},{kind:"block",type:"controls_forEach"},{kind:"block",type:"controls_flow_statements"}]},{kind:"category",name:"❓ Логика",colour:"#66BF3C",contents:[{kind:"block",type:"controls_if"},{kind:"block",type:"logic_compare"},{kind:"block",type:"logic_operation"},{kind:"block",type:"logic_negate"},{kind:"block",type:"logic_boolean"},{kind:"block",type:"logic_null"},{kind:"block",type:"logic_ternary"}]},{kind:"category",name:"🔢 Математика",colour:"#3E87E8",contents:[{kind:"block",type:"math_number"},{kind:"block",type:"math_arithmetic"},{kind:"block",type:"math_single"},{kind:"block",type:"math_trig"},{kind:"block",type:"math_constant"},{kind:"block",type:"math_number_property"},{kind:"block",type:"math_round"},{kind:"block",type:"math_modulo"},{kind:"block",type:"math_constrain"},{kind:"block",type:"math_random_int"},{kind:"block",type:"math_random_float"},{kind:"block",type:"obj_random_int"}]},{kind:"category",name:"📝 Текст",colour:"#5CB3F7",contents:[{kind:"block",type:"text"},{kind:"block",type:"text_join"},{kind:"block",type:"text_append"},{kind:"block",type:"text_length"},{kind:"block",type:"text_isEmpty"},{kind:"block",type:"text_indexOf"},{kind:"block",type:"text_charAt"},{kind:"block",type:"text_getSubstring"},{kind:"block",type:"text_changeCase"},{kind:"block",type:"text_trim"}]},{kind:"category",name:"🧮 Переменные",colour:"#FF8C1A",custom:"VARIABLE"},{kind:"category",name:"📜 Списки",colour:"#745CCC",contents:[{kind:"block",type:"lists_create_with"},{kind:"block",type:"lists_repeat"},{kind:"block",type:"lists_length"},{kind:"block",type:"lists_isEmpty"},{kind:"block",type:"lists_indexOf"},{kind:"block",type:"lists_getIndex"},{kind:"block",type:"lists_setIndex"},{kind:"block",type:"lists_getSublist"},{kind:"block",type:"lists_sort"},{kind:"block",type:"lists_split"}]},{kind:"category",name:"🛠 Функции",colour:"#E8517B",custom:"PROCEDURE"},{kind:"category",name:"🌍 Мир",colour:s,contents:[{kind:"block",type:"obj_player_say"},{kind:"block",type:"obj_set_sky"},{kind:"block",type:"obj_add_score"},{kind:"block",type:"obj_set_score"}]}]},b=`<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="obj_on_start" x="30" y="30"></block>
</xml>`;function k(o,e){return`
import random as _random

def _randint(a, b):
    try:
        a = int(a); b = int(b)
        if a > b: a, b = b, a
        return _random.randint(a, b)
    except:
        return 0

_commands = []
def _emit(op, **kwargs):
    c = {"op": op}
    c.update(kwargs)
    _commands.append(c)

class _This:
    def __init__(self, oid):
        self._oid = oid
    # ─── Motion ───
    def move(self, dx=0, dy=0, dz=0):
        _emit("obj_move", target=self._oid, dx=float(dx), dy=float(dy), dz=float(dz))
    def set_position(self, x=0, y=0, z=0):
        _emit("obj_set_position", target=self._oid, x=float(x), y=float(y), z=float(z))
    def glide_to(self, x=0, y=0, z=0, seconds=1):
        try: s = float(seconds)
        except: s = 1.0
        _emit("obj_glide_to", target=self._oid, x=float(x), y=float(y), z=float(z), seconds=max(0.1, min(s, 30)))
    def rotate(self, deg=0):
        _emit("obj_rotate", target=self._oid, deg=float(deg))
    def set_scale(self, s=1):
        try: s = float(s)
        except: s = 1.0
        _emit("obj_set_scale", target=self._oid, s=max(0.1, min(s, 10)))
    def change_size_by(self, delta=0.1):
        try: d = float(delta)
        except: d = 0.0
        _emit("obj_change_size", target=self._oid, delta=d)
    # ─── Looks ───
    def set_color(self, c="red"):
        _emit("obj_set_color", target=self._oid, color=str(c))
    def say(self, text=""):
        _emit("obj_say", target=self._oid, text=str(text)[:140])
    def hide(self):
        _emit("obj_hide", target=self._oid)
    def show(self):
        _emit("obj_show", target=self._oid)
    def flash(self, color="yellow", seconds=0.3):
        try: s = float(seconds)
        except: s = 0.3
        _emit("obj_flash", target=self._oid, color=str(color), seconds=max(0.05, min(s, 5)))
    # ─── Control ───
    def wait(self, seconds=1):
        try: s = float(seconds)
        except: s = 1.0
        _emit("wait", seconds=max(0.1, min(s, 60)))
    def broadcast(self, name=""):
        _emit("obj_broadcast", target=self._oid, name=str(name)[:60])
    def destroy(self):
        _emit("obj_destroy", target=self._oid)
    def stop_all(self):
        _emit("stop_all")
    # ─── Global-scope helpers (работают в Play и Studio Test) ───
    def add_score(self, n=1):
        try: n = int(n)
        except: n = 1
        _emit("add_score", n=n)
    def set_score(self, n=0):
        try: n = int(n)
        except: n = 0
        _emit("set_score", n=max(0, min(n, 9999)))
    def set_sky(self, preset="day"):
        allowed = {"day","evening","night","cloudy","space"}
        p = str(preset).lower()
        if p not in allowed: p = "day"
        _emit("set_sky", preset=p)
    def player_say(self, text=""):
        _emit("player_say", text=str(text)[:140])

this = _This("${o.replace(/"/g,'\\"')}")

${e}
`}export{k as i,y as n,u as r,b as t};
