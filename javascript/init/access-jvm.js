// 可以通过 Pacakges.全类名 的方式访问java类
let sb = new Packages.java.lang.StringBuilder("M8Test")
// 内部类同样也可以通过 Pacakge.全类名 方式访问, 但是需要将 $ 改成 ., 如 android.widget.FrameLayout$LayoutParams
let LP = Packages.android.widget.FrameLayout.LayoutParams
$console.log("LayoutParams class", LP)
// 调用java对象方法使用 .
sb.append("Javascript")
$console.log(sb.toString());
let JavaTypeTester = Packages.com.m8test.script.core.impl.JavaTypeTester
// 调用java对象属性可以使用 .
$console.log(new JavaTypeTester().OBJECT_FIELD)
// 调用java静态方法使用 .
$console.log(Packages.java.lang.System.currentTimeMillis())
// 调用java静态属性使用 .
$console.log(JavaTypeTester.STATIC_FIELD)
// 实现java非功能性接口(含有多个抽象方法的接口)
JavaTypeTester.setMultiAbstractMethodInterface(
    {
        setInt: function (n) {
            $console.log("setInt" + n)
        },
        getInt: function () {
            $console.log("getInt")
            return 0
        }
    }
)
let mami = JavaTypeTester.getMultiAbstractMethodInterface()
mami.setInt(1234)
$console.log(mami.getInt())
// 实现java功能性接口(只有一个抽象方法的接口)
// 方法1: 直接使用一个函数, 但是可能会没有代码提示并且报错, 实际上这样是没有问题的
// JavaTypeTester.setSingleAbstractMethodInterface(() => {
//     $console.log("getInt")
//     return 0
// })
// 方法2: 通过一个对象, 其中含有一个和java接口抽象方法名相同的函数, 这种方式有代码提示
JavaTypeTester.setSingleAbstractMethodInterface({
    getInt: function () {
        return 0
    }
})
let sami = JavaTypeTester.getSingleAbstractMethodInterface()
$console.log(sami.getInt())