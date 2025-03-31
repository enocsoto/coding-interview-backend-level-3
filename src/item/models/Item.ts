//#region Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';
//#endregion

@Table({
  tableName: 'items',
  timestamps: true
})
export class Item extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  price!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  updatedAt!: Date;
} 