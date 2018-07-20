const isInitialized = element => element.classList.contains('is-initialized');

const openDropdown = dropdown => {
  Array.from(dropdown.querySelectorAll('li')).forEach(opt =>
    opt.setAttribute('tabindex', 0)
  );

  return dropdown.querySelector('.selected').focus();
};

const closeDropdown = dropdown => {
  Array.from(dropdown.querySelectorAll('li')).forEach(opt =>
    opt.removeAttribute('tabindex')
  );

  dropdown.focus();
};

const optionClickEvent = (e, obj) => {
  const { select, dropdown, facade } = obj;
  const option = e.currentTarget;
  const currentSelectedOption = dropdown.querySelector('.selected');
  const clickEvent = document.createEvent('HTMLEvents');

  currentSelectedOption.classList.remove('selected');
  option.classList.add('selected');

  facade.textContent = option.textContent;
  select.value = dropdown.dataset.value;

  clickEvent.initEvent('change', true, false);
  select.dispatchEvent(clickEvent);

  return obj;
};

const documentClickEvent = () => {};

const toggleDropdown = obj => {
  const dropdown = obj.dropdown;

  dropdown.classList.toggle('is-open');

  return dropdown.classList.contains('is-open')
    ? openDropdown(dropdown)
    : closeDropdown(dropdown);
};

const initDropdown = (select, settings) => {
  if (isInitialized(select)) return select;

  let selectedOption = select.querySelector('option:checked');

  select.insertAdjacentHTML(
    'afterend',
    `
    <div class="Dropdown-wrapper">
      <div class="Dropdown-list">
        <ul>
          ${Array.from(select.options)
    .map(
      opt =>
        `<li class="${
          selectedOption.value === opt.value ? 'selected' : ''
        }" data-value="${opt.value}">${opt.innerText}</li>`
    )
    .join('')}
        </ul>
      </div>
      <span class="current">${selectedOption.textContent}</span>
    </div>
  `
  );

  select.classList.add('is-initialized');

  // This isn't super precice, but will do for now
  const dropdown = select.nextElementSibling;
  const facade = dropdown.querySelector('.current');
  const options = dropdown.querySelectorAll('li');

  dropdown.addEventListener('click', () =>
    toggleDropdown({ select, dropdown, facade })
  );

  options.forEach(opt =>
    opt.addEventListener('click', e =>
      optionClickEvent(e, { select, dropdown, facade })
    )
  );

  // document.addEventListener('click', () => documentClickEvent());
};

const Dropdown = args => {
  let settings = Object.assign(
    {
      selector: 'select'
    },
    args
  );

  let elements = document.querySelectorAll(settings.selector);

  return Array.from(elements).map(element => initDropdown(element, settings));
};

export default Dropdown;
