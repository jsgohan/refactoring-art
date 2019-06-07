# 重构API

[将查询函数和修改函数分离(Separate Query from Modifier)](#将查询函数和修改函数分离)

[函数参数化(Parameterize Function)](#函数参数化)

[移除标记参数(Remove Flag Argument)](#移除标记参数)

[保持对象完整(Preserve Whole Object)](#保持对象完整)

[以查询取代参数(Replace Parameter with Query)](#以查询取代参数)

[以参数取代查询(Replace Query with Parameter)](#以参数取代查询)

[移除设值函数(Remove Setting Method)](#移除设值函数)

[以工厂函数取代构造函数(Replace Constructor with Factory Function)](#以工厂函数取代构造函数)

## 将查询函数和修改函数分离

如果某个函数只是提供一个值，没有任何看得到的副作用，那么就可以任意调用这个函数，也可以把调用动作搬到调用函数的其他地方。

```js
// 重构前
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === 'Don') {
      setOfAlarms();
      return 'Don';
    }
    if (p === 'John') {
      setOfAlarms();
      return 'John';
    }
  }
  return '';
}
```

setOfAlarms在这个函数中算是副作用，要把它移除。

首先会给函数替换名字，因为只会留下来查询功能，命名更改为`findMiscreant`。然后在新建的查询函数中去掉副作用。`setOfAlarms`。

```js
function findMiscreant(people) {
  for (const p of people) {
    if (p === 'Don') {
      return 'Don';
    }
    if (p === 'John') {
      return 'John';
    }
  }
  return '';
}
```

`alertForMiscreant`函数部分去掉返回值

```js
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === 'Don') {
      setOfAlarms();
      return;
    }
    if (p === 'John') {
      setOfAlarms();
      return;
    }
  }
  return '';
}
```

原来所有函数的调用者都要一并进行修改，替换成

```js
// 重构前
const found = alertForMiscreant(people);

// 重构后的调用
const found = findMiscreant(people);
alertForMiscreant(people);
```

上面重构完成后，发现会产生大量的重复代码，可以使用替换算法，让修改函数使用查询函数。

```js
// 重构后
function alertForMiscreant(people) {
  if (findMiscreant(people) !== '') setOfAlarms();
}
```

## 函数参数化

如果发现两个函数逻辑非常相似，只有一些字面量值不同，可以将其合并成一个函数，以参数的形式传入不同的值，从而消除重复。

```js
// 重构前
function baseCharge(usage) {
  if (usage < 0) return usd(0);
  const amount = bottomBand(usage) * 0.03 + middleBand(usage) * 0.05 + topBand(usage) * 0.07;
  return usd(amount);
}

function bottomBand(usage) {
  return Math.min(usage, 100);
}

function middleBand(usage) {
  return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function topBand(usage) {
  return usage > 200 ? usage - 200 : 0;
}
```

上面几个函数的逻辑很相似，可以尝试使用参数化来处理。选择`middleBand`函数来添加参数，修改完并将函数名更改为`withBand`。

```js
function withBand(usage, bottom, up) {
  return usage > bottom ? Math.min(usage, up) - bottom : 0;
}
```

对于`topBand`和`bottomBand`，也一样可以用这个函数表示；只不过`topBand`的up要为`Infinity`，`bottomBand`的bottom要为0

```js
// 重构后
function baseCharge(usage) {
  if (usage < 0) return usd(0);
  const amount = withBand(usage, 0, 100) * 0.03 + withBand(usage, 100, 200) * 0.05 + withBand(usage, 200, Infinity) * 0.07;
  return usd(amount);
}

function withBand(usage, bottom, up) {
  return usage > bottom ? Math.min(usage, up) - bottom : 0;
}
```

## 移除标记参数

"标记参数”是调用者用它来指示被调函数应该执行哪一部分逻辑。

标记参数隐藏了函数调用中存在的差异性。布尔型的标记尤其糟糕，因为它们不能清晰地传达其含义—在调用一个函数时，很难弄清true到底是什么意思。如果明确用一个函数来完成一项单独的任务，其含义会清晰得多。

例子

```js
// 重构前
function deliveryDate(anOrder, isRush) {
  if (isRush) {
    let deliveryTime;
    if (['MA', 'CT'].includes(anOrder.deliveryState)) deliveryTime = 1;
    else if (['NY', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliverTime = 3;
    return anOrder.placedOn.plusDays(1 + deliveryTime);
  } else {
    let deliveryTime;
    if (['MA', 'CT', 'NY'].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if (['ME', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliverTime = 4;
    return anOrder.placedOn.plusDays(2 + deliveryTime);
  }
}
```

调用者用这个布尔型字面来判断应该运行哪个分支的diamante—典型的标记参数。

应该将两个分支独立成两个方法，才能更好地表达调用者的意图。

```js
// 重构后
function rushDeliveryDate(anOrder) {
  let deliveryTime;
  if (['MA', 'CT'].includes(anOrder.deliveryState)) deliveryTime = 1;
  else if (['NY', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 2;
  else deliverTime = 3;
  return anOrder.placedOn.plusDays(1 + deliveryTime);
}

function regularDeliveryDate(anOrder) {
  let deliveryTime;
  if (['MA', 'CT', 'NY'].includes(anOrder.deliveryState)) deliveryTime = 2;
  else if (['ME', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 3;
  else deliverTime = 4;
  return anOrder.placedOn.plusDays(2 + deliveryTime);
}
```

## 保持对象完整

如果代码从一个记录结构中导出几个值，然后又把这几个值一起传递给一个函数，可以把整个记录传给这个函数，在函数体内部导出所需的值。

"传递整个记录"的方式能更好地应对变化：如果将来被调的函数需要从记录中导出更多的数据，就能不为此修改参数列表。传递整个记录也能缩短参数列表，让函数调用更容易看懂。

调用者将自己的若干数据作为参数，传递给被调用函数。这种情况下，可以将调用者的自我引用(this)作为参数，直接传递给目标函数。

例子

```js
// 重构前
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high)) {
  alerts.push('room temperature went outside range');
}

class HeatingPlan {
  withinRange(bottom, up) {
    return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
  }
}
```

其实只需将整个范围对象传递给withinRange函数。

```js
// 重构后
if (!aPlan.withinRange(aRoom.daysTempRange)) {
  alerts.push('room temperature went outside range');
}

class HeatingPlan {
  withinRange(aNumberRange) {
    return (aNumberRange.low >= this._temperatureRange.low) && (aNumberRange.high <= this._temperatureRange.high);
  }
}
```

## 以查询取代参数

反向重构：以参数取代查询

参数列表应该尽量避免重复，并且参数列表越短就越容易理解。

如果调用函数时传入了一个值，而这个值由函数自己来获得也是同样容易，这就是重复。

```js
// 重构前
class Order {
  get finalPrice() {
    const basePrice = this.quantity * this.itemPrice;
    let discountLevel;
    if (this.quantity > 100) discountLevel = 2;
    else discountLevel = 1;
    return this.discountedPrice(basePrice, discountLevel);
  }
  
  discountedPrice(basePrice, discountLevel) {
    switch (discountLevel) {
      case 1: return basePrice * 0.95;
      case 2: return basePrice * 0.9;
    }
  }
}
```

```js
// 重构后
class Order {
  get finalPrice() {
    const basePrice = this.quantity * this.itemPrice;
    return this.discountedPrice(basePrice);
  }
  
  get discountLevel() {
    return (this.quantity > 100) ? 2 : 1;
  }
  
  discountedPrice(basePrice) {
    switch (this.discountLevel) {
      case 1: return basePrice * 0.95;
      case 2: return basePrice * 0.9;
    }
  }
}
```

## 以参数取代查询

反向重构：以查询取代参数

在浏览函数实现时，会有一些引用关系，如，引用一个全局变量，或者引用另一个我想要移除的元素。为了解决这些引用，需要将其替换为函数参数，从而将处理引用关系的责任转交给函数的调用者。

为了让目标函数不再依赖于某个元素，可以把这个元素的值以参数形式传递给函数。但需要注意权衡：如果把所有依赖关系都变成参数，会导致参数列表冗长重复；如果作用域之间的共享太多，又会导致函数间依赖过度。

```js
// 重构前
class HeatingPlan {
  get targetTemperature() {
    if (thermostat.selectedTemperature > this._max) return this._max;
    else if (thermostat.selectedTemperature < this._min) return this._min;
    else return thermostat.selectedTemperature;
  }
}

if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();
```

`targetTemperature`函数依赖于全局的thermostat对象。可以把需要这个对象提供的信息作为参数传入，打破对该对象的依赖。

```js
// 重构后
class HeatingPlan {
  targetTemperature(selectedTemperature) {
    if (selectedTemperature > this._max) return this._max;
    else if (selectedTemperature < this._min) return this._min;
    else return selectedTemperature;
  }
}

if (thePlan.targetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
else setOff();
```

将一个依赖关系从一个模块中移出，就意味着将处理这个依赖关系的责任推回给调用者。

## 移除设值函数

如果为某个字段提供了设值函数，这就暗示这个字段可以被改变。如果不希望在对象创建之后此字段还有机会被改变，那就不要为它提供设值函数(同时将该字段声明为不可变)。

```js
// 重构前
class Person {
  get name() { ... }
  set name(aString) { ... }
}
```

去除掉set函数

```js
// 重构后
class Person {
  get name() { ... }
}
```

## 以工厂函数取代构造函数

需要新建一个对象时，客户端通常会调用构造函数。但与一般的函数相比，构造函数又常有一些丑陋的局限性。