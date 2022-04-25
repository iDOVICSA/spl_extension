export class Color {
    listOfColor = ['#ff4d4d', '#18dcff', '#ffaf40', '#fffa65', '#32ff7e', '#7efff5', '#7d5fff', '#cd84f1', '#ffcccc', '#f7aef8'];
    index = 0;



    getNextColor() {
        return this.listOfColor[this.index];
    }

}