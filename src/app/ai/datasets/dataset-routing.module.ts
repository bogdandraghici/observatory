import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DatasetComponent } from './dataset.component'

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: DatasetComponent }
    ])],
    exports: [RouterModule]
})
export class DatasetRoutingModule { }
