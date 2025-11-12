/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filteredTodos, setFilteredTodos] = useState<Todo[] | null>(todos);

  useEffect(() => {
    async function fetchTodos() {
      try {
        const todosFromServer = await getTodos();

        setTodos(todosFromServer);
      } catch (error) {
        setErrorMessage('Unable to load todos');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }

    fetchTodos();
  }, []);

  useEffect(() => {
    if (filter && todos) {
      switch (filter) {
        case 'all':
          setFilteredTodos(todos);
          break;
        case 'active':
          setFilteredTodos(todos.filter(todo => !todo.completed));
          break;
        case 'completed':
          setFilteredTodos(todos.filter(todo => todo.completed));
          break;
        default:
          setFilteredTodos(todos);
          break;
      }
    }
  }, [filter, todos]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  function toggleTodoCompleted(todoId: number) {
    setTodos(prevTodos => {
      if (!prevTodos) {
        return prevTodos;
      }

      setIsLoaded(true);
      setTimeout(() => {
        setIsLoaded(false);
      }, 100);

      return prevTodos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      );
    });
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
            disabled
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              disabled
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {/* This todo is an active todo */}
          {filteredTodos?.map((todo: Todo) => {
            return (
              <div
                data-cy="Todo"
                key={todo.id}
                className={classNames('todo', {
                  completed: todo.completed,
                  'is-active': isLoaded,
                })}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    checked={todo.completed}
                    className="todo__status"
                    onChange={() => toggleTodoCompleted(todo.id)}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>

        {todos && todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length | 0} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filter === 'all',
                })}
                data-cy="FilterLinkAll"
                onClick={() => setFilter('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filter === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => setFilter('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filter === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter('completed')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: errorMessage === null },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage && errorMessage}
      </div>
    </div>
  );
};
