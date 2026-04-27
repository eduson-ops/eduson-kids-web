var e=`<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ek_on_start" deletable="false" x="40" y="40"></block>
</xml>`,t=[{id:`path-1`,trainerId:`path`,n:1,title:`Первый шаг`,prompt:`Дойди до цветка на 1 клетке впереди. Один блок «идти вперёд» — и готово!`,hints:[`Найди блок «идти вперёд» в категории «Движение».`,`Поставь его внутрь «при запуске».`,`Достаточно одного шага: move_forward(1).`],starterBlocks:e,starterPython:`move_forward(1)
`,check:{kind:`reach-goal`,goalX:0,goalZ:-1},maxBlocks:2,reward:{coins:5,xp:10}},{id:`path-2`,trainerId:`path`,n:2,title:`Три клетки`,prompt:`Пройди три клетки вперёд. Можно тремя блоками — или одним с числом.`,hints:[`Три «идти вперёд» подряд — это 3 клетки.`,`Лучше — один блок «идти вперёд 3 шагов».`,`В Python: move_forward(3).`],starterBlocks:e,starterPython:`move_forward(3)
`,check:{kind:`reach-goal`,goalX:0,goalZ:-3},maxBlocks:4,reward:{coins:5,xp:10}},{id:`path-3`,trainerId:`path`,n:3,title:`Поворот направо`,prompt:`Дойди до цели: 2 клетки вперёд, поверни направо, ещё 2 клетки.`,hints:[`После 2 шагов вперёд используй «повернуть направо».`,`Потом снова «идти вперёд» на 2.`,`move_forward(2); turn_right(); move_forward(2).`],starterBlocks:e,starterPython:`move_forward(2)
turn_right()
move_forward(2)
`,check:{kind:`reach-goal`,goalX:2,goalZ:-2},maxBlocks:5,reward:{coins:7,xp:12}},{id:`path-4`,trainerId:`path`,n:4,title:`Поворот налево`,prompt:`Дойди до цели слева впереди: 3 вперёд, налево, 2 вперёд.`,hints:[`Налево — это turn_left().`,`После поворота налево «вперёд» пойдёт в −X.`,`move_forward(3); turn_left(); move_forward(2).`],starterBlocks:e,starterPython:`move_forward(3)
turn_left()
move_forward(2)
`,check:{kind:`reach-goal`,goalX:-2,goalZ:-3},maxBlocks:5,reward:{coins:7,xp:12}},{id:`path-5`,trainerId:`path`,n:5,title:`Зигзаг`,prompt:`Пройди зигзагом до (2, −4): вперёд 2, направо 2, налево 2, и ещё 2 вперёд.`,hints:[`Следи за углом: после right-left ты снова смотришь по −Z.`,`Двигайся небольшими шагами — по 2 клетки.`,`move_forward(2); turn_right(); move_forward(2); turn_left(); move_forward(2).`],starterBlocks:e,starterPython:`move_forward(2)
turn_right()
move_forward(2)
turn_left()
move_forward(2)
`,check:{kind:`reach-goal`,goalX:2,goalZ:-4},maxBlocks:8,reward:{coins:10,xp:15}},{id:`path-6`,trainerId:`path`,n:6,title:`Разворот`,prompt:`Сначала сходи на 3 клетки вперёд, потом развернись кругом и вернись в старт (0, 0).`,hints:[`Развернуться кругом — это два поворота направо подряд.`,`После разворота ты смотришь по +Z и move_forward уменьшает дистанцию.`,`move_forward(3); turn_right(); turn_right(); move_forward(3).`],starterBlocks:e,starterPython:`move_forward(3)
turn_right()
turn_right()
move_forward(3)
`,check:{kind:`reach-goal`,goalX:0,goalZ:0},maxBlocks:6,reward:{coins:10,xp:15}},{id:`path-7`,trainerId:`path`,n:7,title:`Квадрат по периметру`,prompt:`Обойди по периметру квадрат 3×3: вперёд 3, направо, вперёд 3, направо, вперёд 3, направо, вперёд 3. Придёшь в (0,0).`,hints:[`Четыре одинаковых шага: идти 3 и повернуть направо.`,`Используй цикл «повторить 4 раза» чтобы не копировать.`,`for _ in range(4): move_forward(3); turn_right().`],starterBlocks:e,starterPython:`for _ in range(4):
    move_forward(3)
    turn_right()
`,check:{kind:`reach-goal`,goalX:0,goalZ:0},maxBlocks:10,reward:{coins:12,xp:18}},{id:`path-8`,trainerId:`path`,n:8,title:`Длинная дорога`,prompt:`Дойди до дальней цели (0, −10). Попробуй сделать это одним блоком.`,hints:[`Число шагов может быть любым в пределах 50.`,`Не обязательно по одному — одним блоком «идти вперёд 10 шагов».`,`move_forward(10).`],starterBlocks:e,starterPython:`move_forward(10)
`,check:{kind:`reach-goal`,goalX:0,goalZ:-10},maxBlocks:2,reward:{coins:8,xp:12}},{id:`path-9`,trainerId:`path`,n:9,title:`Ступеньки`,prompt:`Пройди ступеньками до (3, −6). Каждая ступенька: 2 вперёд и 1 направо.`,hints:[`Повторяй пару «вперёд 2, направо 1» 3 раза.`,`После «направо 1» снова поверни налево чтобы смотреть по −Z.`,`Эффективно — цикл на 3 повтора с 4 действиями внутри.`],starterBlocks:e,starterPython:`for _ in range(3):
    move_forward(2)
    turn_right()
    move_forward(1)
    turn_left()
`,check:{kind:`reach-goal`,goalX:3,goalZ:-6},maxBlocks:12,reward:{coins:15,xp:20}},{id:`path-10`,trainerId:`path`,n:10,title:`Лабиринт-кольцо`,prompt:`Цель — (−3, −3). Обойди невидимую стену: вперёд 5, налево 3, налево 2, направо и ещё 1.`,hints:[`Разбей задачу: сначала продвинься по −Z, потом сверни налево дважды.`,`После первого налево «вперёд» идёт по −X.`,`move_forward(5); turn_left(); move_forward(3); turn_left(); move_forward(2); turn_right(); move_forward(1).`],starterBlocks:e,starterPython:`move_forward(5)
turn_left()
move_forward(3)
turn_left()
move_forward(2)
turn_right()
move_forward(1)
`,check:{kind:`reach-goal`,goalX:-3,goalZ:-3},maxBlocks:14,reward:{coins:20,xp:25}}],n=(e,t=`red`)=>e.map(([e,n,r])=>({x:e,y:n,z:r,color:t})),r=[{id:`tower-1`,trainerId:`tower`,n:1,title:`Один блок`,prompt:`Поставь один красный блок под ногами (в (0, 0, 0)).`,hints:[`Блок «поставить блок» в категории «Мир».`,`По умолчанию цвет — красный.`,`place_block(0, 0, 0, "red").`],starterBlocks:e,starterPython:`place_block(0, 0, 0, "red")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0]],`red`)},maxBlocks:2,reward:{coins:5,xp:10}},{id:`tower-2`,trainerId:`tower`,n:2,title:`Ряд из трёх`,prompt:`Поставь ряд из 3 синих блоков по оси X: (0,0,0), (1,0,0), (2,0,0).`,hints:[`Три place_block подряд, у каждого x = 0, 1, 2.`,`Цвет — "blue".`,`Можно использовать line(3, 0, 0, "blue").`],starterBlocks:e,starterPython:`place_block(0, 0, 0, "blue")
place_block(1, 0, 0, "blue")
place_block(2, 0, 0, "blue")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0],[1,0,0],[2,0,0]],`blue`)},maxBlocks:4,reward:{coins:7,xp:12}},{id:`tower-3`,trainerId:`tower`,n:3,title:`Башенка 3`,prompt:`Построй вертикальную башню из 3 зелёных блоков в точке (0, 0..2, 0).`,hints:[`Меняй Y, а не X/Z — тогда блоки идут вверх.`,`Y = 0, 1, 2.`,`for y in range(3): place_block(0, y, 0, "green").`],starterBlocks:e,starterPython:`for y in range(3):
    place_block(0, y, 0, "green")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0],[0,1,0],[0,2,0]],`green`)},maxBlocks:5,reward:{coins:8,xp:14}},{id:`tower-4`,trainerId:`tower`,n:4,title:`Квадрат 3×3`,prompt:`Выложи квадратную плиту 3×3 из жёлтых блоков на земле (y=0).`,hints:[`Это двойной цикл: for i и for j.`,`Координаты x=0..2, z=0..2, y=0.`,`square(3, 0, 0, "yellow") тоже решает.`],starterBlocks:e,starterPython:`for i in range(3):
    for j in range(3):
        place_block(i, 0, j, "yellow")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0],[1,0,0],[2,0,0],[0,0,1],[1,0,1],[2,0,1],[0,0,2],[1,0,2],[2,0,2]],`yellow`)},maxBlocks:10,reward:{coins:12,xp:18}},{id:`tower-5`,trainerId:`tower`,n:5,title:`Квадрат красный`,prompt:`Построй квадрат 3×3 из красных блоков — тренируем вложенный for.`,hints:[`Не копируй 9 блоков! Используй цикл в цикле.`,`Цвет "red", y = 0.`,`for i in range(3): for j in range(3): place_block(i, 0, j, "red").`],starterBlocks:e,starterPython:`for i in range(3):
    for j in range(3):
        place_block(i, 0, j, "red")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0],[1,0,0],[2,0,0],[0,0,1],[1,0,1],[2,0,1],[0,0,2],[1,0,2],[2,0,2]],`red`)},maxBlocks:10,reward:{coins:12,xp:18}},{id:`tower-6`,trainerId:`tower`,n:6,title:`Лестница из 4`,prompt:`Построй лестницу: (0,0,0), (1,1,0), (2,2,0), (3,3,0) — синие.`,hints:[`Каждая ступенька на 1 выше и на 1 дальше.`,`x и y одинаковые у каждой ступеньки.`,`for i in range(4): place_block(i, i, 0, "blue").`],starterBlocks:e,starterPython:`for i in range(4):
    place_block(i, i, 0, "blue")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0],[1,1,0],[2,2,0],[3,3,0]],`blue`)},maxBlocks:6,reward:{coins:14,xp:20}},{id:`tower-7`,trainerId:`tower`,n:7,title:`Две башни`,prompt:`Построй две башни из 3 блоков: одну в (0,y,0) красную, вторую в (3,y,0) жёлтую.`,hints:[`Сделай две функции: tower(3, 0, 0, "red") и tower(3, 3, 0, "yellow").`,`Или два цикла по очереди.`,`for y in range(3): place_block(0,y,0,"red"); place_block(3,y,0,"yellow").`],starterBlocks:e,starterPython:`for y in range(3):
    place_block(0, y, 0, "red")
    place_block(3, y, 0, "yellow")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:[...n([[0,0,0],[0,1,0],[0,2,0]],`red`),...n([[3,0,0],[3,1,0],[3,2,0]],`yellow`)]},maxBlocks:10,reward:{coins:15,xp:22}},{id:`tower-8`,trainerId:`tower`,n:8,title:`Рамка 3×3`,prompt:`Построй квадратную рамку 3×3 из зелёных блоков — только по периметру, середина пуста.`,hints:[`Внутри двойного for используй if: клади блок если на краю.`,`Условие: i == 0 or i == 2 or j == 0 or j == 2.`,`Или сделай 4 прямые границы линиями.`],starterBlocks:e,starterPython:`for i in range(3):
    for j in range(3):
        if i == 0 or i == 2 or j == 0 or j == 2:
            place_block(i, 0, j, "green")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:n([[0,0,0],[1,0,0],[2,0,0],[0,0,1],[2,0,1],[0,0,2],[1,0,2],[2,0,2]],`green`)},maxBlocks:12,reward:{coins:18,xp:24}},{id:`tower-9`,trainerId:`tower`,n:9,title:`Пирамида 3`,prompt:`Построй пирамиду: нижний этаж 3×3 синий, средний 2×2 жёлтый, верхний 1 красный (по центру).`,hints:[`Три вложенных цикла — по одному на этаж.`,`Y=0 → 3×3, Y=1 → 2×2, Y=2 → 1×1.`,`Посмотри на square() в справке — он строит квадратную плиту.`],starterBlocks:e,starterPython:`for i in range(3):
    for j in range(3):
        place_block(i, 0, j, "blue")
for i in range(2):
    for j in range(2):
        place_block(i, 1, j, "yellow")
place_block(0, 2, 0, "red")
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:[...n([[0,0,0],[1,0,0],[2,0,0],[0,0,1],[1,0,1],[2,0,1],[0,0,2],[1,0,2],[2,0,2]],`blue`),...n([[0,1,0],[1,1,0],[0,1,1],[1,1,1]],`yellow`),...n([[0,2,0]],`red`)]},maxBlocks:16,reward:{coins:25,xp:30}},{id:`tower-10`,trainerId:`tower`,n:10,title:`Башня-пирамида 5`,prompt:`Построй пирамиду 5×5 → 3×3 → 1×1 синего цвета. Подсказка: сдвигай основание, чтобы каждый этаж был по центру.`,hints:[`Три слоя: y=0 → 5×5, y=1 → 3×3 (сдвиг +1), y=2 → 1×1 (сдвиг +2).`,`Двойной for для каждого этажа.`,`Можешь написать функцию square(sz, ox, oy): for i,j in range(sz): place_block(i+ox, oy, j+ox, "blue").`],starterBlocks:e,starterPython:`def layer(size, y, off):
    for i in range(size):
        for j in range(size):
            place_block(i+off, y, j+off, "blue")
layer(5, 0, 0)
layer(3, 1, 1)
layer(1, 2, 2)
`,check:{kind:`build-pattern`,strictColor:!0,expectedBlocks:[...n(Array.from({length:5},(e,t)=>Array.from({length:5},(e,n)=>[t,0,n])).flat(),`blue`),...n(Array.from({length:3},(e,t)=>Array.from({length:3},(e,n)=>[t+1,1,n+1])).flat(),`blue`),...n([[2,2,2]],`blue`)]},maxBlocks:20,reward:{coins:30,xp:35}}],i=[{id:`path`,emoji:`🐧`,title:`Маршрут`,tagline:`Двигай пингвина из старта в цель`,description:`Учимся давать команды: идти вперёд, поворачивать налево и направо. 10 коротких задач от одного шага до сложного лабиринта.`,color:`#6B5CE7`,puzzles:t},{id:`tower`,emoji:`🧱`,title:`Башня`,tagline:`Построй фигуру из блоков`,description:`Цветные блоки, координаты X-Y-Z и циклы. Соберём квадрат 3×3, лестницу и целую пирамиду.`,color:`#FF9454`,puzzles:r},{id:`loop`,emoji:`🔁`,title:`Цикл`,tagline:`Повторяй действия умно`,description:`Один раз — медленно, а 5 раз — один цикл. Напечатаем 5 приветов, посчитаем сумму и построим ёлочку.`,color:`#9FE8C7`,puzzles:[{id:`loop-1`,trainerId:`loop`,n:1,title:`Первый print`,prompt:`Напечатай строку «Привет!» в консоль.`,hints:[`Используй print в категории «Текст».`,`Аргумент — строка «Привет!».`,`print("Привет!")`],starterBlocks:e,starterPython:`print("Привет!")
`,check:{kind:`output-match`,expected:[`Привет!`]},reward:{coins:5,xp:10}},{id:`loop-2`,trainerId:`loop`,n:2,title:`Три раза`,prompt:`Напечатай «Ок» три раза. Решается циклом.`,hints:[`Используй цикл for i in range(3).`,`Внутри — print("Ок").`,`for i in range(3): print("Ок")`],starterBlocks:e,starterPython:`for i in range(3):
    print("Ок")
`,check:{kind:`output-match`,expected:[`Ок`,`Ок`,`Ок`]},reward:{coins:7,xp:12}},{id:`loop-3`,trainerId:`loop`,n:3,title:`Пять раз «Привет!»`,prompt:`Напечатай «Привет!» пять раз. Только одним циклом — без копипасты.`,hints:[`Цикл — это обязательно. Проверка убедится в наличии range.`,`for i in range(5).`,`Внутри — print("Привет!").`],starterBlocks:e,starterPython:`for i in range(5):
    print("Привет!")
`,check:{kind:`output-match`,expected:[`Привет!`,`Привет!`,`Привет!`,`Привет!`,`Привет!`]},reward:{coins:8,xp:14}},{id:`loop-4`,trainerId:`loop`,n:4,title:`Числа от 0 до 4`,prompt:`Напечатай числа от 0 до 4 (включительно), каждое на своей строке.`,hints:[`range(5) даёт 0, 1, 2, 3, 4.`,`print(i) — внутри цикла.`,`for i in range(5): print(i)`],starterBlocks:e,starterPython:`for i in range(5):
    print(i)
`,check:{kind:`output-match`,expected:[`0`,`1`,`2`,`3`,`4`]},reward:{coins:10,xp:15}},{id:`loop-5`,trainerId:`loop`,n:5,title:`Обратный отсчёт`,prompt:`Напечатай от 5 до 1 — по одному числу на строку.`,hints:[`range(5, 0, -1) — считает назад.`,`Или for i in range(5): print(5 - i).`,`Или вручную 5 принтов: сначала 5, потом 4, 3, 2, 1.`],starterBlocks:e,starterPython:`for i in range(5, 0, -1):
    print(i)
`,check:{kind:`output-match`,expected:[`5`,`4`,`3`,`2`,`1`]},reward:{coins:12,xp:18}},{id:`loop-6`,trainerId:`loop`,n:6,title:`Сумма до 10`,prompt:`Посчитай сумму чисел от 1 до 10 и напечатай её. Должно получиться 55.`,hints:[`Заведи переменную total = 0.`,`В цикле прибавляй i: total = total + i.`,`В конце print(total).`],starterBlocks:e,starterPython:`total = 0
for i in range(1, 11):
    total = total + i
print(total)
`,check:{kind:`output-match`,expected:[`55`]},reward:{coins:15,xp:20}},{id:`loop-7`,trainerId:`loop`,n:7,title:`Чётные числа`,prompt:`Напечатай первые 5 чётных чисел: 0, 2, 4, 6, 8.`,hints:[`range(0, 10, 2) идёт с шагом 2.`,`Или for i in range(5): print(i*2).`,`Главное — 5 значений.`],starterBlocks:e,starterPython:`for i in range(0, 10, 2):
    print(i)
`,check:{kind:`output-match`,expected:[`0`,`2`,`4`,`6`,`8`]},reward:{coins:15,xp:20}},{id:`loop-8`,trainerId:`loop`,n:8,title:`Таблица умножения`,prompt:`Напечатай таблицу умножения на 3: 3, 6, 9, 12, 15.`,hints:[`for i in range(1, 6): print(i*3).`,`Индекс 1..5, умножение на 3.`,`Пять строк подряд.`],starterBlocks:e,starterPython:`for i in range(1, 6):
    print(i * 3)
`,check:{kind:`output-match`,expected:[`3`,`6`,`9`,`12`,`15`]},reward:{coins:18,xp:22}},{id:`loop-9`,trainerId:`loop`,n:9,title:`Ёлочка`,prompt:`Напечатай «ёлочку» — звёздочками: строка 1 — «*», строка 2 — «**», строка 3 — «***», строка 4 — «****».`,hints:[`В цикле for i in range(1, 5): делай строку из i звёздочек.`,`"*" * i даёт повтор символа.`,`print("*" * i).`],starterBlocks:e,starterPython:`for i in range(1, 5):
    print("*" * i)
`,check:{kind:`output-match`,expected:[`*`,`**`,`***`,`****`]},reward:{coins:20,xp:25}},{id:`loop-10`,trainerId:`loop`,n:10,title:`Цикл в цикле`,prompt:`Напечатай таблицу 3×3 умножения (1*1 .. 3*3): 9 строк вида «1 x 1 = 1», «1 x 2 = 2», … , «3 x 3 = 9».`,hints:[`Нужны два цикла один внутри другого.`,`for i in range(1,4): for j in range(1,4): print(f"{i} x {j} = {i*j}").`,`Итого 9 строк.`],starterBlocks:e,starterPython:`for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} x {j} = {i*j}")
`,check:{kind:`output-match`,expected:[`1 x 1 = 1`,`1 x 2 = 2`,`1 x 3 = 3`,`2 x 1 = 2`,`2 x 2 = 4`,`2 x 3 = 6`,`3 x 1 = 3`,`3 x 2 = 6`,`3 x 3 = 9`]},reward:{coins:25,xp:30}}]},{id:`if`,emoji:`🤔`,title:`Условие`,tagline:`Решай по ситуации`,description:`if/else, elif и сравнения. От простого «больше-меньше» до полного FizzBuzz.`,color:`#FFD43C`,puzzles:[{id:`if-1`,trainerId:`if`,n:1,title:`Первое условие`,prompt:`Заведи переменную x=10. Если x больше 5 — напечатай «Большое». Иначе ничего.`,hints:[`if x > 5: ... — выполнится только если условие верно.`,`Переменной присваивают равно: x = 10.`,`Внутри if — print("Большое").`],starterBlocks:e,starterPython:`x = 10
if x > 5:
    print("Большое")
`,check:{kind:`output-match`,expected:[`Большое`]},reward:{coins:8,xp:12}},{id:`if-2`,trainerId:`if`,n:2,title:`Либо больше, либо меньше`,prompt:`x=3. Если x > 5 — напечатай «Большое», иначе — «Маленькое».`,hints:[`if / else — вместе.`,`if x > 5: ... else: ...`,`В else — print("Маленькое").`],starterBlocks:e,starterPython:`x = 3
if x > 5:
    print("Большое")
else:
    print("Маленькое")
`,check:{kind:`output-match`,expected:[`Маленькое`]},reward:{coins:10,xp:14}},{id:`if-3`,trainerId:`if`,n:3,title:`Чётное или нечётное`,prompt:`x=7. Напечатай «чётное» если x%2==0, иначе «нечётное».`,hints:[`Остаток от деления — оператор %.`,`if x % 2 == 0: print("чётное") else: print("нечётное").`,`Для 7 ответ — «нечётное».`],starterBlocks:e,starterPython:`x = 7
if x % 2 == 0:
    print("чётное")
else:
    print("нечётное")
`,check:{kind:`output-match`,expected:[`нечётное`]},reward:{coins:12,xp:16}},{id:`if-4`,trainerId:`if`,n:4,title:`Цикл + условие`,prompt:`Для чисел 1..6 напечатай «да» если число чётное, иначе «нет». Всего 6 строк.`,hints:[`Цикл и условие внутри.`,`for i in range(1,7): if i % 2 == 0: print("да") else: print("нет").`,`Ожидаемый ответ: нет, да, нет, да, нет, да.`],starterBlocks:e,starterPython:`for i in range(1, 7):
    if i % 2 == 0:
        print("да")
    else:
        print("нет")
`,check:{kind:`output-match`,expected:[`нет`,`да`,`нет`,`да`,`нет`,`да`]},reward:{coins:16,xp:22}},{id:`if-5`,trainerId:`if`,n:5,title:`FizzBuzz мини`,prompt:`Для чисел 1..5 напечатай «Fizz» если число делится на 3, иначе само число. Ожидается: 1, 2, Fizz, 4, 5.`,hints:[`Условие делимости: i % 3 == 0.`,`if i % 3 == 0: print("Fizz") else: print(i).`,`Для i от 1 до 5 включительно.`],starterBlocks:e,starterPython:`for i in range(1, 6):
    if i % 3 == 0:
        print("Fizz")
    else:
        print(i)
`,check:{kind:`output-match`,expected:[`1`,`2`,`Fizz`,`4`,`5`]},reward:{coins:18,xp:24}},{id:`if-6`,trainerId:`if`,n:6,title:`Знак числа`,prompt:`x = −3. Напечатай «плюс» если x>0, «минус» если x<0, «ноль» если x==0. Ожидается «минус».`,hints:[`Три ветки: if / elif / else.`,`if x > 0: ... elif x < 0: ... else: ...`,`Для −3 сработает elif.`],starterBlocks:e,starterPython:`x = -3
if x > 0:
    print("плюс")
elif x < 0:
    print("минус")
else:
    print("ноль")
`,check:{kind:`output-match`,expected:[`минус`]},reward:{coins:20,xp:26}},{id:`if-7`,trainerId:`if`,n:7,title:`Шаг с условием`,prompt:`Пройди 3 шага вперёд. Если в коде есть проверка if — прыгни в конце. Код обязан содержать if.`,hints:[`Задача — проверить навык писать if.`,`if True: jump() — формально решит.`,`Используй move_forward и в if — jump().`],starterBlocks:e,starterPython:`x = 5
move_forward(3)
if x > 0:
    jump()
`,check:{kind:`uses-feature`,required:[`if`]},maxBlocks:8,reward:{coins:18,xp:24}},{id:`if-8`,trainerId:`if`,n:8,title:`Макс из двух`,prompt:`a=7, b=4. Напечатай максимум из них. Используй if. Ожидается 7.`,hints:[`if a > b: print(a) else: print(b).`,`Без max() — тренируем if.`,`Ответ для a=7, b=4 — 7.`],starterBlocks:e,starterPython:`a = 7
b = 4
if a > b:
    print(a)
else:
    print(b)
`,check:{kind:`output-match`,expected:[`7`]},reward:{coins:20,xp:26}},{id:`if-9`,trainerId:`if`,n:9,title:`Проверка диапазона`,prompt:`x=15. Если x между 10 и 20 — печатай «средний», иначе «крайний». Ожидается «средний».`,hints:[`Можно и через and: if x >= 10 and x <= 20.`,`Или вложить два if.`,`Напечатай соответствующий текст в каждой ветке.`],starterBlocks:e,starterPython:`x = 15
if x >= 10 and x <= 20:
    print("средний")
else:
    print("крайний")
`,check:{kind:`output-match`,expected:[`средний`]},reward:{coins:22,xp:28}},{id:`if-10`,trainerId:`if`,n:10,title:`FizzBuzz полный`,prompt:`Для чисел 1..15 напечатай: «FizzBuzz» если делится на 15, «Fizz» если на 3, «Buzz» если на 5, иначе само число.`,hints:[`Сначала проверяй 15, потом 3, потом 5, иначе — число.`,`if i % 15 == 0: ... elif i % 3 == 0: ... elif i % 5 == 0: ... else: print(i).`,`Так как 15=3*5, порядок важен — 15 в первую очередь.`],starterBlocks:e,starterPython:`for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
`,check:{kind:`output-match`,expected:[`1`,`2`,`Fizz`,`4`,`Buzz`,`Fizz`,`7`,`8`,`Fizz`,`Buzz`,`11`,`Fizz`,`13`,`14`,`FizzBuzz`]},reward:{coins:30,xp:40}}]},{id:`function`,emoji:`📦`,title:`Функция`,tagline:`Соберай своё: def и вызов`,description:`Функции дают имена действиям. Напишем square(x), add(a,b) и даже рекурсивный countdown.`,color:`#FFB4C8`,puzzles:[{id:`function-1`,trainerId:`function`,n:1,title:`Первая функция`,prompt:`Определи функцию hello() которая печатает «Привет!», и вызови её один раз.`,hints:[`def hello(): ...`,`В теле — print("Привет!").`,`Не забудь вызвать: hello().`],starterBlocks:e,starterPython:`def hello():
    print("Привет!")

hello()
`,check:{kind:`output-match`,expected:[`Привет!`]},reward:{coins:10,xp:14}},{id:`function-2`,trainerId:`function`,n:2,title:`Функция с параметром`,prompt:`Определи функцию greet(name) которая печатает «Привет, <name>!». Вызови её один раз с «Саша».`,hints:[`def greet(name): ...`,`f-строка: print(f"Привет, {name}!").`,`greet("Саша").`],starterBlocks:e,starterPython:`def greet(name):
    print(f"Привет, {name}!")

greet("Саша")
`,check:{kind:`output-match`,expected:[`Привет, Саша!`]},reward:{coins:12,xp:16}},{id:`function-3`,trainerId:`function`,n:3,title:`Три вызова`,prompt:`Определи функцию hi() и вызови её 3 раза. Проверка убедится что функция вызвана >= 3 раз.`,hints:[`def hi(): print("Hi").`,`Вызови hi() три раза подряд.`,`Или циклом: for _ in range(3): hi().`],starterBlocks:e,starterPython:`def hi():
    print("Hi")

hi()
hi()
hi()
`,check:{kind:`uses-feature`,required:[`def`,`call3`]},reward:{coins:15,xp:20}},{id:`function-4`,trainerId:`function`,n:4,title:`Квадрат числа`,prompt:`Функция square(x) возвращает x*x. Напечатай square(2), square(3), square(4). Ожидается 4, 9, 16.`,hints:[`def square(x): return x * x.`,`print(square(2)) и так трижды.`,`Цикл: for i in [2,3,4]: print(square(i)).`],starterBlocks:e,starterPython:`def square(x):
    return x * x

print(square(2))
print(square(3))
print(square(4))
`,check:{kind:`output-match`,expected:[`4`,`9`,`16`]},reward:{coins:18,xp:24}},{id:`function-5`,trainerId:`function`,n:5,title:`Сумма двух`,prompt:`Функция add(a, b) возвращает их сумму. Напечатай add(2,3), add(10,5), add(7,8). Ожидается 5, 15, 15.`,hints:[`def add(a, b): return a + b.`,`Три вызова с разными аргументами.`,`print(add(2,3)) и так далее.`],starterBlocks:e,starterPython:`def add(a, b):
    return a + b

print(add(2, 3))
print(add(10, 5))
print(add(7, 8))
`,check:{kind:`output-match`,expected:[`5`,`15`,`15`]},reward:{coins:20,xp:25}},{id:`function-6`,trainerId:`function`,n:6,title:`Функция двигает игрока`,prompt:`Функция step(n) делает move_forward(n). Вызови step(2), step(3). Должен дойти до (0, −5).`,hints:[`def step(n): move_forward(n).`,`step(2); step(3) — всего 5 шагов по −Z.`,`Проверка: reach-goal до (0, −5).`],starterBlocks:e,starterPython:`def step(n):
    move_forward(n)

step(2)
step(3)
`,check:{kind:`reach-goal`,goalX:0,goalZ:-5},reward:{coins:20,xp:25}},{id:`function-7`,trainerId:`function`,n:7,title:`Факториал 5`,prompt:`Функция fact(n) возвращает факториал. Напечатай fact(5). Ожидается 120.`,hints:[`Факториал: 5! = 5*4*3*2*1 = 120.`,`def fact(n): r=1; for i in range(1,n+1): r=r*i; return r.`,`print(fact(5)).`],starterBlocks:e,starterPython:`def fact(n):
    r = 1
    for i in range(1, n + 1):
        r = r * i
    return r

print(fact(5))
`,check:{kind:`output-match`,expected:[`120`]},reward:{coins:25,xp:30}},{id:`function-8`,trainerId:`function`,n:8,title:`Чётный?`,prompt:`Функция is_even(n) возвращает True/False. Напечатай is_even(4), is_even(7). Ожидается True, False.`,hints:[`def is_even(n): return n % 2 == 0.`,`print выведет True или False.`,`Два вызова.`],starterBlocks:e,starterPython:`def is_even(n):
    return n % 2 == 0

print(is_even(4))
print(is_even(7))
`,check:{kind:`output-match`,expected:[`True`,`False`]},reward:{coins:22,xp:28}},{id:`function-9`,trainerId:`function`,n:9,title:`Квадраты-рамки`,prompt:`Напиши функцию build_square(size, ox, color), которая строит квадрат size×size в y=0 со сдвигом ox. Вызови 3 раза: build_square(2,0,"red"), build_square(2,3,"blue"), build_square(2,6,"yellow").`,hints:[`def build_square(size, ox, color): for i in range(size): for j in range(size): place_block(i+ox, 0, j, color).`,`Три вызова с разными аргументами.`,`Проверка uses-feature: def и 3+ вызова.`],starterBlocks:e,starterPython:`def build_square(size, ox, color):
    for i in range(size):
        for j in range(size):
            place_block(i + ox, 0, j, color)

build_square(2, 0, "red")
build_square(2, 3, "blue")
build_square(2, 6, "yellow")
`,check:{kind:`uses-feature`,required:[`def`,`for`,`call3`]},reward:{coins:30,xp:35}},{id:`function-10`,trainerId:`function`,n:10,title:`Рекурсивный счётчик`,prompt:`Функция countdown(n) печатает числа от n до 1 (каждое на своей строке), потом «Бум!». Вызови countdown(3). Ожидается 3, 2, 1, Бум!.`,hints:[`Можно циклом, а можно рекурсией.`,`def countdown(n): if n <= 0: print("Бум!"); return; print(n); countdown(n-1).`,`countdown(3).`],starterBlocks:e,starterPython:`def countdown(n):
    if n <= 0:
        print("Бум!")
        return
    print(n)
    countdown(n - 1)

countdown(3)
`,check:{kind:`output-match`,expected:[`3`,`2`,`1`,`Бум!`]},reward:{coins:35,xp:45}}]},{id:`detective`,emoji:`🕵️`,title:`Детектив`,tagline:`Раскрой кражу кода — списки, словари, функции`,description:`Детектив Алекс расследует кражу исходного кода. 5 подозреваемых, 10 задач на Python: списки, словари, срезы строк, функции и логика and/or/not. Для тех, кто уже знает основы.`,color:`#A06BE0`,puzzles:[{id:`detective-1`,trainerId:`detective`,n:1,title:`Список подозреваемых`,prompt:`ДАНО:
suspects = ["Хакс", "Байт", "Баг", "Логик", "Нуль"]

ЗАДАЧА:
Напечатай количество подозреваемых.
Используй функцию len().

ОЖИДАЕТСЯ:
5`,hints:[`Функция len() считает количество элементов в списке.`,`len(suspects) вернёт число 5.`,`print(len(suspects))`],starterPython:`suspects = ["Хакс", "Байт", "Баг", "Логик", "Нуль"]

# Напечатай количество подозреваемых
print(  )  # вставь len(suspects)
`,check:{kind:`output-match`,expected:[`5`]},reward:{coins:8,xp:12},beforeSlide:{chapter:`Пролог`,emoji:`🔍`,title:`Дело об украденном коде`,text:`Ночью из Академии программирования похитили
исходный код легендарной игры «КодМастер»!
Детектив Алекс получает дело и составляет
список всех, кто был в здании той ночью.`}},{id:`detective-2`,trainerId:`detective`,n:2,title:`Проверка алиби`,prompt:`ДАНО:
alibis = {"Хакс": True, "Байт": False,
          "Баг": False, "Логик": True, "Нуль": False}
True = алиби есть, False = алиби нет

ЗАДАЧА:
Перебери словарь через .items() и напечатай
имена тех, у кого НЕТ алиби (False).

ОЖИДАЕТСЯ:
Байт
Баг
Нуль`,hints:[`for name, has_alibi in alibis.items(): — перебирает пары ключ-значение.`,`Условие «нет алиби»: if not has_alibi:`,`Внутри условия: print(name)`],starterPython:`alibis = {"Хакс": True, "Байт": False, "Баг": False, "Логик": True, "Нуль": False}

for name, has_alibi in alibis.items():
    if not has_alibi:
        pass  # ← замени pass на print(name)
`,check:{kind:`output-match`,expected:[`Байт`,`Баг`,`Нуль`]},reward:{coins:10,xp:14},beforeSlide:{chapter:`Глава 1`,emoji:`🪪`,title:`Алиби не у всех`,text:`Алекс собирает показания.
Хакс был на уроке — видели 20 свидетелей.
Логик убирала второй этаж — это подтверждено.
А вот у Байт, Баг и Нуль алиби нет!`}},{id:`detective-3`,trainerId:`detective`,n:3,title:`Расшифровка записки`,prompt:`ДАНО:
letters = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
code = [1, 0, 7, 0]  # индексы букв в алфавите

ЗАДАЧА:
Собери строку result: для каждого числа n
в code добавь letters[n] к result.
Напечатай result.

ОЖИДАЕТСЯ:
БАЗА`,hints:[`letters[1] = "Б", letters[0] = "А", letters[7] = "З".`,`result += letters[n] — добавляет одну букву к строке.`,`Полный код: result = ""; for n in code: result += letters[n]; print(result)`],starterPython:`letters = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
code = [1, 0, 7, 0]

result = ""
for n in code:
    result += ""  # ← замени "" на letters[n]

print(result)
`,check:{kind:`output-match`,expected:[`БАЗА`]},reward:{coins:12,xp:16},beforeSlide:{chapter:`Глава 2`,emoji:`📜`,title:`Тайная записка`,text:`На столе директора найдена записка!
В ней числа: 1, 0, 7, 0.
Алекс понимает: это индексы букв в алфавите.
«Если расшифровать — узнаю место тайника!»`}},{id:`detective-4`,trainerId:`detective`,n:4,title:`Анализ следов`,prompt:`ДАНО:
shoe_sizes = {"Хакс": 42, "Байт": 37,
              "Баг": 44, "Логик": 38, "Нуль": 44}

ЗАДАЧА:
Перебери словарь и напечатай имена тех,
у кого размер обуви РАВЕН 44.

ОЖИДАЕТСЯ:
Баг
Нуль`,hints:[`for name, size in shoe_sizes.items(): — перебирает пары.`,`Условие: if size == 44:`,`Внутри: print(name)`],starterPython:`shoe_sizes = {"Хакс": 42, "Байт": 37, "Баг": 44, "Логик": 38, "Нуль": 44}

for name, size in shoe_sizes.items():
    if size == 44:
        pass  # ← замени pass на print(name)
`,check:{kind:`output-match`,expected:[`Баг`,`Нуль`]},reward:{coins:12,xp:16},beforeSlide:{chapter:`Глава 3`,emoji:`👟`,title:`Следы на полу`,text:`Криминалист измерил следы на месте преступления.
Размер обуви вора: 44!
Алекс проверяет данные на всех подозреваемых.
«Кто из них носит 44-й размер?»`}},{id:`detective-5`,trainerId:`detective`,n:5,title:`Запись с камеры`,prompt:`ДАНО:
entry_times = {"Хакс": 17, "Байт": 22,
               "Баг": 23, "Логик": 9, "Нуль": 22}
Числа — час входа в здание (17 = 17:00)

ЗАДАЧА:
Напечатай имена тех, кто вошёл ровно в 22:00
(hour == 22).

ОЖИДАЕТСЯ:
Байт
Нуль`,hints:[`for name, hour in entry_times.items(): — перебирает пары.`,`Условие: if hour == 22:`,`Внутри: print(name)`],starterPython:`entry_times = {"Хакс": 17, "Байт": 22, "Баг": 23, "Логик": 9, "Нуль": 22}

for name, hour in entry_times.items():
    if hour == 22:
        pass  # ← замени pass на print(name)
`,check:{kind:`output-match`,expected:[`Байт`,`Нуль`]},reward:{coins:14,xp:18},beforeSlide:{chapter:`Глава 4`,emoji:`📷`,title:`Камера не лжёт`,text:`Охранник нашёл запись с камеры входа!
Время похищения: около 22:00.
Алекс смотрит, кто именно зашёл в здание
в 22:00 — и круг подозреваемых сужается.`}},{id:`detective-6`,trainerId:`detective`,n:6,title:`Пересечение улик`,prompt:`ДАНО:
no_alibi = ["Байт", "Баг", "Нуль"]
big_shoes = ["Баг", "Нуль"]

ЗАДАЧА:
Напечатай тех, кто одновременно есть
в обоих списках (нет алиби И обувь 44).
Используй оператор: if name in big_shoes

ОЖИДАЕТСЯ:
Баг
Нуль`,hints:[`for name in no_alibi: — перебирает список.`,`Условие: if name in big_shoes: — проверяет вхождение.`,`Внутри: print(name)`],starterPython:`no_alibi = ["Байт", "Баг", "Нуль"]
big_shoes = ["Баг", "Нуль"]

for name in no_alibi:
    if name in big_shoes:
        pass  # ← замени pass на print(name)
`,check:{kind:`output-match`,expected:[`Баг`,`Нуль`]},reward:{coins:14,xp:18},beforeSlide:{chapter:`Глава 5`,emoji:`🔗`,title:`Улики пересекаются`,text:`У Алекса теперь два списка:
— без алиби: Байт, Баг, Нуль
— обувь 44-й: Баг, Нуль
Кто входит В ОБА списка сразу?
Только так можно найти настоящего подозреваемого!`}},{id:`detective-7`,trainerId:`detective`,n:7,title:`Скрытое имя`,prompt:`ДАНО:
text = "ВЖИАККТПОИРЙ"

ЗАДАЧА:
Возьми каждый ВТОРОЙ символ строки,
начиная с индекса 0 (шаг = 2).
Синтаксис: text[начало:конец:шаг]
Напечатай результат.

ОЖИДАЕТСЯ:
ВИКТОР`,hints:[`Срез с шагом: text[::шаг] — берёт каждый шаг-й символ.`,`Каждый второй: шаг = 2, поэтому text[::2].`,`message = text[::2]; print(message)`],starterPython:`text = "ВЖИАККТПОИРЙ"

# Срез с шагом: text[::шаг]
# Каждый второй символ — шаг равен 2
message = text[::1]  # ← измени 1 на нужный шаг
print(message)
`,check:{kind:`output-match`,expected:[`ВИКТОР`]},reward:{coins:16,xp:22},beforeSlide:{chapter:`Глава 6`,emoji:`🔡`,title:`Зашифрованное имя`,text:`В кармане пальто найдена скрытая записка!
В ней странная строка: «ВЖИАККТПОИРЙ».
Алекс догадался: чтобы прочитать имя,
нужно взять каждый второй символ...`}},{id:`detective-8`,trainerId:`detective`,n:8,title:`Алгоритм дедукции`,prompt:`ЗАДАЧА:
Напиши функцию is_suspect(has_alibi, shoe_size).
Она должна вернуть "подозреваемый"
если НЕТ алиби И размер == 44.
Иначе — вернуть "снят".

ОЖИДАЕТСЯ:
подозреваемый
снят
снят`,hints:[`Условие: if not has_alibi and shoe_size == 44:`,`Добавь это условие ПЕРЕД строкой return "снят".`,`Внутри условия: return "подозреваемый"`],starterPython:`def is_suspect(has_alibi, shoe_size):
    # Верни "подозреваемый" если НЕТ алиби И размер == 44
    # Подсказка: if not has_alibi and shoe_size == 44:
    return "снят"  # ← добавь условие выше этой строки

print(is_suspect(False, 44))  # ожидается: подозреваемый
print(is_suspect(True, 44))   # ожидается: снят
print(is_suspect(False, 42))  # ожидается: снят
`,check:{kind:`output-match`,expected:[`подозреваемый`,`снят`,`снят`]},reward:{coins:18,xp:24},beforeSlide:{chapter:`Глава 7`,emoji:`⚙️`,title:`Машина дедукции`,text:`Алекс решает написать алгоритм!
Функция проверит сразу два условия:
✗ Нет алиби  +  ✗ Обувь 44-й размер
Если оба выполнены — человек подозреваемый.`}},{id:`detective-9`,trainerId:`detective`,n:9,title:`Финальная дедукция`,prompt:`ДАНО:
data = [
  ("Хакс",  True,  42, 17),
  ("Байт",  False, 37, 22),
  ("Баг",   False, 44, 23),
  ("Логик", True,  38,  9),
  ("Нуль",  False, 44, 22),
]
Поля: (имя, алиби, обувь, час_входа)

ЗАДАЧА:
Напечатай имя того, у кого:
— НЕТ алиби (not alibi)
— обувь 44 (shoe == 44)
— вход в 22:00 (hour == 22)

ОЖИДАЕТСЯ:
Нуль`,hints:[`for name, alibi, shoe, hour in data: — распаковывает кортежи.`,`Три условия сразу: if not alibi and shoe == 44 and hour == 22:`,`Внутри условия: print(name)`],starterPython:`data = [
    ("Хакс",  True,  42, 17),
    ("Байт",  False, 37, 22),
    ("Баг",   False, 44, 23),
    ("Логик", True,  38,  9),
    ("Нуль",  False, 44, 22),
]

for name, alibi, shoe, hour in data:
    # Напечатай name если: not alibi AND shoe == 44 AND hour == 22
    pass  # ← замени pass на условие
`,check:{kind:`output-match`,expected:[`Нуль`]},reward:{coins:20,xp:28},beforeSlide:{chapter:`Глава 8`,emoji:`🎯`,title:`Последняя проверка`,text:`Алекс собирает всё в одну таблицу.
Теперь нужно проверить три условия сразу:
1. Нет алиби
2. Обувь 44-го размера
3. Вошёл в 22:00
Кто единственный подходит под все три?`}},{id:`detective-10`,trainerId:`detective`,n:10,title:`Разоблачение!`,prompt:`ДАНО:
criminal = "Виктор Нуль"
clues = ["нет алиби", "размер обуви 44", "вход в 22:00"]

ЗАДАЧА:
Напечатай три строки:
1) "Преступник: Виктор Нуль"
2) "Улик: 3"
3) Каждую улику с префиксом "  — "

ОЖИДАЕТСЯ:
Преступник: Виктор Нуль
Улик: 3
  — нет алиби
  — размер обуви 44
  — вход в 22:00`,hints:[`f-строка: f"Преступник: {criminal}" подставит имя.`,`f"Улик: {len(clues)}" выведет количество улик.`,`for clue in clues: print(f"  — {clue}")`],starterPython:`criminal = "Виктор Нуль"
clues = ["нет алиби", "размер обуви 44", "вход в 22:00"]

print(f"Преступник: {criminal}")
print(f"Улик: {len(clues)}")

for clue in clues:
    print(f"  — {clue}")
`,check:{kind:`output-match`,expected:[`Преступник: Виктор Нуль`,`Улик: 3`,`  — нет алиби`,`  — размер обуви 44`,`  — вход в 22:00`]},reward:{coins:25,xp:35},beforeSlide:{chapter:`Финал`,emoji:`🚨`,title:`Преступник найден!`,text:`Алекс смотрит на результат алгоритма.
Только один человек подходит под все три улики:
ВИКТОР НУЛЬ — директор академии!
Он сам украл код, чтобы продать конкурентам.
Детектив вызывает полицию. Дело закрыто!`}}]}];function a(e){return i.find(t=>t.id===e)}function o(e,t){let n=a(e);if(n)return n.puzzles.find(e=>e.n===t)}var s=`ek_solved_`;function c(e){try{let t=localStorage.getItem(s+e);if(!t)return new Set;let n=JSON.parse(t);return Array.isArray(n)?new Set(n.filter(e=>typeof e==`number`)):new Set}catch{return new Set}}function l(e,t){let n=c(e);n.add(t);try{localStorage.setItem(s+e,JSON.stringify([...n]))}catch{}}function u(e){return c(e).size}function d(e){let t=c(e);for(let e=1;e<=10;e++)if(!t.has(e))return e;return 1}export{c as a,u as i,d as n,a as o,o as r,l as s,i as t};